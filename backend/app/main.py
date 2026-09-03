"""
A.R.M.O.R. Backend — FastAPI Application Entry Point
"""
from __future__ import annotations

import asyncio
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.db import init_db
from app.websocket import manager
from app.services.simulation import simulation_loop, get_engine
from app.schemas.telemetry import WSEvent, WSEventType
from app.api.routes.telemetry import router as telemetry_router

# ─── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


# ─── Broadcast Helper ─────────────────────────────────────────────────────────

async def broadcast_telemetry_packet(packet) -> None:
    """Broadcast a telemetry packet to all connected dashboard clients."""
    event = WSEvent(
        event=WSEventType.TELEMETRY,
        data=packet.model_dump(mode="json"),
    )
    await manager.broadcast(event)


# ─── Application Lifespan ─────────────────────────────────────────────────────

_sim_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    global _sim_task

    logger.info("=" * 60)
    logger.info("  A.R.M.O.R. MISSION CONTROL BACKEND")
    logger.info("  Autonomous Reconnaissance & Mine Operation Rover")
    logger.info("=" * 60)
    logger.info(f"  Rover ID     : {settings.rover_id}")
    logger.info(f"  Mission ID   : {settings.mission_id}")
    logger.info(f"  Telemetry    : {settings.telemetry_mode}")
    logger.info(f"  Scenario     : {settings.sim_scenario}")
    logger.info("=" * 60)

    # Initialize database
    await init_db()

    # Start simulation loop (only in simulation mode)
    if settings.telemetry_mode == "simulation":
        _sim_task = asyncio.create_task(
            simulation_loop(broadcast_telemetry_packet),
            name="simulation_loop",
        )
        logger.info("[APP] Simulation loop started.")

    yield  # Application runs here

    # Shutdown
    if _sim_task and not _sim_task.done():
        _sim_task.cancel()
        try:
            await _sim_task
        except asyncio.CancelledError:
            pass
    logger.info("[APP] A.R.M.O.R. backend shutdown complete.")


# ─── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="A.R.M.O.R. Mission Control API",
    description="Backend for the Autonomous Reconnaissance & Mine Operation Rover",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the Vite dev server to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(telemetry_router)


# ─── Root Endpoint ─────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "system": "A.R.M.O.R. Mission Control",
        "version": "0.1.0",
        "status": "online",
        "docs": "/docs",
        "websocket": "ws://localhost:8000/ws/telemetry",
    }


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.backend_reload,
        log_level="info",
    )
