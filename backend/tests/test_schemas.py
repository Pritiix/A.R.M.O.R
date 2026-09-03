"""
A.R.M.O.R. — Unit Tests: Telemetry Schemas
Run with: pytest tests/test_schemas.py -v
"""
import pytest
from datetime import datetime
from app.schemas.telemetry import (
    TelemetryPacket, RoverData, SensorData, CommunicationData,
    SensorHealthMap, HazardLevel, RoverMode, RoverStatus, SensorHealth
)


def test_telemetry_packet_defaults():
    packet = TelemetryPacket()
    assert packet.rover_id == "ARMOR-01"
    assert packet.mission_id == "MISSION-001"
    assert packet.sequence == 0
    assert isinstance(packet.timestamp, datetime)


def test_sensor_data_none_values():
    """Sensors should support None (disconnected/missing)."""
    s = SensorData(temperature=None, humidity=None, smoke_raw=None)
    assert s.temperature is None
    assert s.smoke_raw is None


def test_sensor_data_validation():
    """Out-of-range values should fail validation."""
    with pytest.raises(Exception):
        SensorData(smoke_raw=9999)  # max 4095


def test_hazard_level_enum():
    assert HazardLevel.NORMAL == "NORMAL"
    assert HazardLevel.WARNING == "WARNING"
    assert HazardLevel.CRITICAL == "CRITICAL"


def test_packet_serialization():
    packet = TelemetryPacket()
    json_str = packet.model_dump_json()
    assert "ARMOR-01" in json_str
    assert "timestamp" in json_str


def test_sensor_health_map():
    h = SensorHealthMap()
    assert h.mq2 == SensorHealth.OFFLINE
    assert h.esp32 == SensorHealth.OFFLINE


def test_rover_data():
    r = RoverData(battery=75.0, speed=0.5, mode=RoverMode.AUTONOMOUS)
    assert r.battery == 75.0
    assert r.mode == RoverMode.AUTONOMOUS
