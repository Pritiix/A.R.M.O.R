"""
A.R.M.O.R. Backend — SQLite Database Layer
Async SQLite via aiosqlite. Stores mission events locally — no cloud.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Optional

import aiosqlite
from app.core.config import settings
from app.schemas.telemetry import MissionEvent, TelemetryPacket

logger = logging.getLogger(__name__)

# Extract the actual file path from the SQLite URL
_DB_PATH = settings.database_url.replace("sqlite+aiosqlite:///", "")


async def init_db() -> None:
    """Create tables on startup if they don't exist."""
    async with aiosqlite.connect(_DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS mission_events (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                mission_id  TEXT NOT NULL,
                rover_id    TEXT NOT NULL,
                timestamp   TEXT NOT NULL,
                event_type  TEXT NOT NULL,
                description TEXT NOT NULL,
                severity    TEXT NOT NULL DEFAULT 'NORMAL',
                zone        TEXT,
                metadata    TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS telemetry_snapshots (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                mission_id  TEXT NOT NULL,
                rover_id    TEXT NOT NULL,
                timestamp   TEXT NOT NULL,
                packet_json TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_events_mission
            ON mission_events (mission_id, timestamp)
        """)
        await db.commit()
    logger.info("[DB] Database initialized.")


async def insert_event(event: MissionEvent) -> int:
    """Persist a mission event. Returns the new row ID."""
    async with aiosqlite.connect(_DB_PATH) as db:
        cursor = await db.execute(
            """
            INSERT INTO mission_events
                (mission_id, rover_id, timestamp, event_type, description, severity, zone, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.mission_id,
                event.rover_id,
                event.timestamp.isoformat(),
                event.event_type.value,
                event.description,
                event.severity.value,
                event.zone,
                json.dumps(event.metadata) if event.metadata else None,
            ),
        )
        await db.commit()
        return cursor.lastrowid or 0


async def get_events(
    mission_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict]:
    """Retrieve mission events, optionally filtered by mission."""
    query = "SELECT * FROM mission_events"
    params: list = []
    if mission_id:
        query += " WHERE mission_id = ?"
        params.append(mission_id)
    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    async with aiosqlite.connect(_DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def save_telemetry_snapshot(packet: TelemetryPacket) -> None:
    """Persist a telemetry snapshot for mission reporting."""
    async with aiosqlite.connect(_DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO telemetry_snapshots (mission_id, rover_id, timestamp, packet_json)
            VALUES (?, ?, ?, ?)
            """,
            (
                packet.mission_id,
                packet.rover_id,
                packet.timestamp.isoformat(),
                packet.model_dump_json(),
            ),
        )
        await db.commit()
