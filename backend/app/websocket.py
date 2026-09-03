"""
A.R.M.O.R. Backend — WebSocket Connection Manager
Handles multiple frontend clients subscribing to live telemetry.
"""
from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Set

from fastapi import WebSocket
from app.schemas.telemetry import WSEvent, WSEventType

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages all active WebSocket connections.
    Supports broadcast (to all clients) and targeted messages.
    """

    def __init__(self) -> None:
        self._connections: Dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()

    async def connect(self, client_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections[client_id] = websocket
        logger.info(f"[WS] Client connected: {client_id}. Total: {len(self._connections)}")

    async def disconnect(self, client_id: str) -> None:
        async with self._lock:
            self._connections.pop(client_id, None)
        logger.info(f"[WS] Client disconnected: {client_id}. Total: {len(self._connections)}")

    async def broadcast(self, event: WSEvent) -> None:
        """Send an event to ALL connected frontend clients."""
        payload = event.model_dump_json()
        dead: Set[str] = set()

        async with self._lock:
            clients = dict(self._connections)

        for client_id, ws in clients.items():
            try:
                await ws.send_text(payload)
            except Exception as exc:
                logger.warning(f"[WS] Failed to send to {client_id}: {exc}")
                dead.add(client_id)

        # Clean up dead connections
        if dead:
            async with self._lock:
                for cid in dead:
                    self._connections.pop(cid, None)

    async def send_to(self, client_id: str, event: WSEvent) -> bool:
        """Send an event to a specific client. Returns False if client not found."""
        async with self._lock:
            ws = self._connections.get(client_id)
        if ws is None:
            return False
        try:
            await ws.send_text(event.model_dump_json())
            return True
        except Exception as exc:
            logger.warning(f"[WS] Failed to send to {client_id}: {exc}")
            await self.disconnect(client_id)
            return False

    @property
    def client_count(self) -> int:
        return len(self._connections)

    @property
    def client_ids(self) -> list[str]:
        return list(self._connections.keys())


# Global singleton — imported by routes
manager = ConnectionManager()
