"""
A.R.M.O.R. Backend — Telemetry REST + WebSocket Routes
"""
from __future__ import annotations

import logging
import uuid
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.responses import JSONResponse

from app.schemas.telemetry import (
    RoverCommand,
    SimulationScenario,
    WSEvent,
    WSEventType,
    MissionEvent,
    EventType,
    HazardLevel,
)
from app.websocket import manager
from app.services.simulation import get_engine
from app.database import db
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


# ─── WebSocket — Frontend Dashboard ───────────────────────────────────────────

@router.websocket("/ws/telemetry")
async def ws_telemetry(websocket: WebSocket):
    """
    Frontend connects here to receive live telemetry events.
    Supports multiple concurrent clients.
    """
    client_id = f"dashboard-{uuid.uuid4().hex[:8]}"
    await manager.connect(client_id, websocket)

    # Send initial connection status
    await manager.send_to(
        client_id,
        WSEvent(
            event=WSEventType.CONNECTION_STATUS,
            data={
                "rover_connected": True,
                "rover_id": settings.rover_id,
                "mission_id": settings.mission_id,
                "telemetry_mode": settings.telemetry_mode,
                "client_id": client_id,
            },
        ),
    )

    try:
        while True:
            # Keep connection alive; actual telemetry is pushed by simulation loop
            raw = await websocket.receive_text()
            # Handle ping/pong from client
            if raw == '{"type":"ping"}':
                await websocket.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(client_id)


# ─── REST — Telemetry Ingestion (from ESP32 in live mode) ─────────────────────

@router.post("/api/telemetry")
async def receive_telemetry(packet: dict):
    """
    ESP32 firmware POSTs telemetry here in live mode.
    Validates, then broadcasts to all connected WebSocket clients.
    """
    from app.schemas.telemetry import TelemetryPacket

    try:
        parsed = TelemetryPacket.model_validate(packet)
    except Exception as exc:
        logger.warning(f"[API] Malformed telemetry packet rejected: {exc}")
        raise HTTPException(status_code=422, detail=f"Invalid telemetry: {exc}")

    event = WSEvent(
        event=WSEventType.TELEMETRY,
        data=parsed.model_dump(mode="json"),
    )
    await manager.broadcast(event)

    # Persist snapshot periodically (every 10th packet)
    if parsed.sequence % 10 == 0:
        try:
            await db.save_telemetry_snapshot(parsed)
        except Exception as exc:
            logger.error(f"[DB] Failed to save snapshot: {exc}")

    return {"status": "ok", "sequence": parsed.sequence}


# ─── REST — Commands (React → FastAPI → ESP32) ────────────────────────────────

@router.post("/api/commands")
async def send_command(command: RoverCommand):
    """
    Dashboard sends rover commands here.
    In simulation mode: updates simulator state.
    In live mode: forwards to ESP32.
    """
    logger.info(f"[CMD] Command received: {command.command} val={command.value}")

    if settings.telemetry_mode == "simulation":
        # Forward command to simulation engine to update simulated state
        engine = get_engine()
        engine.handle_command(command.command.value, command.value)

        # In simulation, log the command as a mission event
        event = MissionEvent(
            mission_id=settings.mission_id,
            rover_id=settings.rover_id,
            event_type=EventType.ROVER_COMMAND,
            description=f"Command: {command.command.value} (value={command.value})",
            severity=HazardLevel.NORMAL,
        )
        try:
            await db.insert_event(event)
        except Exception as exc:
            logger.error(f"[DB] Failed to insert command event: {exc}")

    else:
        # TODO Phase 9: Forward to ESP32 via HTTP/WebSocket
        pass

    # Broadcast command ack to frontend
    await manager.broadcast(
        WSEvent(
            event=WSEventType.COMMAND_ACK,
            data={
                "command": command.command.value,
                "value": command.value,
                "status": "acknowledged",
            },
        )
    )
    return {"status": "ok", "command": command.command.value}


# ─── REST — Simulation Control ────────────────────────────────────────────────

@router.post("/api/simulation/scenario")
async def set_scenario(scenario: str):
    """Change the simulation scenario at runtime."""
    try:
        new_scenario = SimulationScenario(scenario.upper())
    except ValueError:
        valid = [s.value for s in SimulationScenario]
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Valid: {valid}")

    engine = get_engine()
    engine.set_scenario(new_scenario)

    # Broadcast scenario change
    await manager.broadcast(
        WSEvent(
            event=WSEventType.CONNECTION_STATUS,
            data={"sim_scenario": new_scenario.value},
        )
    )
    return {"status": "ok", "scenario": new_scenario.value}


@router.get("/api/simulation/scenarios")
async def list_scenarios():
    """Return available simulation scenarios."""
    return {"scenarios": [s.value for s in SimulationScenario]}


# ─── REST — Mission Events ─────────────────────────────────────────────────────

@router.get("/api/events")
async def get_events(
    mission_id: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """Retrieve mission events from local SQLite."""
    events = await db.get_events(mission_id=mission_id, limit=limit, offset=offset)
    return {"events": events, "count": len(events)}


# ─── REST — Health Check ──────────────────────────────────────────────────────

@router.get("/api/health")
async def health_check():
    """Backend health probe used by the frontend status bar."""
    return {
        "status": "ok",
        "rover_id": settings.rover_id,
        "mission_id": settings.mission_id,
        "telemetry_mode": settings.telemetry_mode,
        "ws_clients": manager.client_count,
    }


@router.get("/api/status")
async def system_status():
    """Extended system status."""
    return {
        "backend": "ONLINE",
        "telemetry_mode": settings.telemetry_mode,
        "ws_clients": manager.client_count,
        "rover_id": settings.rover_id,
        "mission_id": settings.mission_id,
    }
