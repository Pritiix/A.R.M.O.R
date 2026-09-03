"""
A.R.M.O.R. Backend — Canonical Pydantic Telemetry Schemas
ONE canonical schema used across the entire backend.
Frontend TypeScript interfaces must mirror this exactly.
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ─── Enumerations ──────────────────────────────────────────────────────────────

class SensorHealth(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    STALE = "STALE"
    ERROR = "ERROR"


class HazardLevel(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class RoverMode(str, Enum):
    MANUAL = "MANUAL"
    AUTONOMOUS = "AUTONOMOUS"
    SAFE = "SAFE"
    STOPPED = "STOPPED"


class RoverStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    MOVING = "MOVING"
    STOPPED = "STOPPED"
    ERROR = "ERROR"


class CommandType(str, Enum):
    MOVE_FORWARD = "MOVE_FORWARD"
    MOVE_BACKWARD = "MOVE_BACKWARD"
    TURN_LEFT = "TURN_LEFT"
    TURN_RIGHT = "TURN_RIGHT"
    STOP = "STOP"
    EMERGENCY_STOP = "EMERGENCY_STOP"
    BUZZER_ON = "BUZZER_ON"
    BUZZER_OFF = "BUZZER_OFF"
    LIGHTS_ON = "LIGHTS_ON"
    LIGHTS_OFF = "LIGHTS_OFF"
    SET_MODE = "SET_MODE"


class TelemetryMode(str, Enum):
    SIMULATION = "simulation"
    LIVE = "live"


class SimulationScenario(str, Enum):
    NORMAL = "NORMAL"
    SMOKE_WARNING = "SMOKE_WARNING"
    SMOKE_CRITICAL = "SMOKE_CRITICAL"
    PERSON_DETECTED = "PERSON_DETECTED"
    WEAK_COMMUNICATION = "WEAK_COMMUNICATION"
    LOW_BATTERY = "LOW_BATTERY"
    COMMUNICATION_LOST = "COMMUNICATION_LOST"
    COMMUNICATION_RESTORED = "COMMUNICATION_RESTORED"


# ─── Telemetry Sub-Models ─────────────────────────────────────────────────────

class SensorData(BaseModel):
    """All sensor readings. Extend here to add new sensors."""
    # MQ-2: Smoke / Combustible Gas
    # DISCLAIMER: Raw ADC + estimated ppm. NOT certified measurements.
    smoke_raw: Optional[int] = Field(default=None, ge=0, le=4095, description="MQ-2 raw ADC (0-4095)")
    smoke_ppm: Optional[float] = Field(default=None, ge=0.0, description="Estimated smoke/gas ppm")
    smoke_status: HazardLevel = Field(default=HazardLevel.NORMAL)

    # DHT11: Temperature & Humidity
    temperature: Optional[float] = Field(default=None, description="Temperature in °C")
    humidity: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Humidity %RH")

    # LDR: Light Level
    light: Optional[int] = Field(default=None, ge=0, le=100, description="Light level 0-100%")
    light_status: HazardLevel = Field(default=HazardLevel.NORMAL)


class RoverData(BaseModel):
    """Rover state — drive, mode, battery."""
    battery: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Battery %")
    speed: Optional[float] = Field(default=None, ge=0.0, le=5.0, description="Speed m/s")
    heading: Optional[float] = Field(default=None, ge=0.0, le=360.0, description="Heading degrees")
    mode: RoverMode = Field(default=RoverMode.MANUAL)
    status: RoverStatus = Field(default=RoverStatus.STOPPED)


class CommunicationData(BaseModel):
    """Wi-Fi / radio link statistics."""
    rssi: Optional[float] = Field(default=None, description="Signal strength dBm")
    packet_rate: Optional[float] = Field(default=None, ge=0.0, description="Packets/second")
    packet_loss: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Packet loss %")
    latency_ms: Optional[float] = Field(default=None, ge=0.0, description="Round-trip latency ms")
    connected: bool = Field(default=False)


class SensorHealthMap(BaseModel):
    """Per-sensor health status. Never silently show 0 for missing sensors."""
    mq2: SensorHealth = Field(default=SensorHealth.OFFLINE)
    dht11: SensorHealth = Field(default=SensorHealth.OFFLINE)
    ldr: SensorHealth = Field(default=SensorHealth.OFFLINE)
    camera: SensorHealth = Field(default=SensorHealth.OFFLINE)
    esp32: SensorHealth = Field(default=SensorHealth.OFFLINE)


class PositionData(BaseModel):
    """Rover position in mine coordinate system (metres from origin)."""
    x: float = Field(default=0.0)
    y: float = Field(default=0.0)
    zone: str = Field(default="UNKNOWN")


# ─── Canonical Telemetry Packet ───────────────────────────────────────────────

class TelemetryPacket(BaseModel):
    """
    THE canonical telemetry structure.
    Used by: ESP32 firmware | FastAPI backend | React frontend | Simulator.
    Any change here must be propagated to the TypeScript types.
    """
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    rover_id: str = Field(default="ARMOR-01")
    mission_id: str = Field(default="MISSION-001")
    sequence: int = Field(default=0, ge=0, description="Packet sequence number")

    sensors: SensorData = Field(default_factory=SensorData)
    rover: RoverData = Field(default_factory=RoverData)
    communication: CommunicationData = Field(default_factory=CommunicationData)
    sensor_health: SensorHealthMap = Field(default_factory=SensorHealthMap)
    position: PositionData = Field(default_factory=PositionData)

    # Simulation metadata — stripped in live mode
    sim_scenario: Optional[str] = Field(default=None)


# ─── Command Schema ───────────────────────────────────────────────────────────

class RoverCommand(BaseModel):
    """Command sent from dashboard → backend → ESP32."""
    command: CommandType
    value: Optional[float] = Field(default=None, description="e.g. speed 0.0-1.0")
    issued_by: str = Field(default="OPERATOR")
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))



# ─── Mission Event ────────────────────────────────────────────────────────────

class EventType(str, Enum):
    MISSION_STARTED = "MISSION_STARTED"
    MISSION_PAUSED = "MISSION_PAUSED"
    MISSION_ENDED = "MISSION_ENDED"
    SMOKE_WARNING = "SMOKE_WARNING"
    SMOKE_CRITICAL = "SMOKE_CRITICAL"
    PERSON_DETECTED = "PERSON_DETECTED"
    ROVER_COMMAND = "ROVER_COMMAND"
    COMMUNICATION_LOST = "COMMUNICATION_LOST"
    COMMUNICATION_RESTORED = "COMMUNICATION_RESTORED"
    LOW_BATTERY = "LOW_BATTERY"
    SENSOR_ERROR = "SENSOR_ERROR"
    SYSTEM = "SYSTEM"


class MissionEvent(BaseModel):
    """A timestamped event stored in the local SQLite mission log."""
    id: Optional[int] = Field(default=None)
    mission_id: str = Field(default="MISSION-001")
    rover_id: str = Field(default="ARMOR-01")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: EventType
    description: str
    severity: HazardLevel = Field(default=HazardLevel.NORMAL)
    zone: Optional[str] = Field(default=None)
    metadata: Optional[dict] = Field(default=None)


# ─── WebSocket Event Envelope ─────────────────────────────────────────────────

class WSEventType(str, Enum):
    TELEMETRY = "telemetry"
    ALERT = "alert"
    CONNECTION_STATUS = "connection_status"
    MISSION_EVENT = "mission_event"
    COMMAND_ACK = "command_ack"
    ERROR = "error"


class WSEvent(BaseModel):
    """WebSocket message envelope. All WS messages use this wrapper."""
    event: WSEventType
    data: dict
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
