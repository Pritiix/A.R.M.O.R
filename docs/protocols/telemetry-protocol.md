# Telemetry Protocol

## Overview

This document defines the canonical A.R.M.O.R. telemetry protocol.

> **One schema. One truth. All layers must conform.**

The same structure is used by:
- ESP32 firmware (JSON over HTTP/WebSocket)
- FastAPI backend (Pydantic model)
- React frontend (TypeScript interface)
- Simulator engine

---

## Uplink: Rover → Backend

### Telemetry Packet (ESP32 → FastAPI)

**Endpoint:** `POST /api/telemetry` or WebSocket `ws://backend/ws/rover`

```json
{
  "timestamp": "2025-01-01T12:00:00.000Z",
  "rover_id": "ARMOR-01",
  "mission_id": "MISSION-001",
  "sensors": {
    "smoke_raw": 120,
    "smoke_ppm": 45.2,
    "smoke_status": "NORMAL",
    "temperature": 28.4,
    "humidity": 64.0,
    "light": 70,
    "light_status": "NORMAL"
  },
  "rover": {
    "battery": 74,
    "speed": 0.8,
    "heading": 270,
    "mode": "AUTONOMOUS",
    "status": "MOVING"
  },
  "communication": {
    "rssi": -70,
    "packet_rate": 10,
    "connected": true
  },
  "sensor_health": {
    "mq2": "ONLINE",
    "dht11": "ONLINE",
    "ldr": "ONLINE",
    "camera": "ONLINE",
    "esp32": "ONLINE"
  },
  "position": {
    "x": 12.5,
    "y": 7.3,
    "zone": "CORRIDOR_B"
  }
}
```

---

## Downlink: Backend → Rover

### Command Packet (React → FastAPI → ESP32)

**Endpoint:** `POST /api/commands`

```json
{
  "command": "MOVE_FORWARD",
  "value": 0.8,
  "issued_by": "OPERATOR",
  "timestamp": "2025-01-01T12:00:01.000Z"
}
```

### Supported Commands

| Command | Value | Description |
|---|---|---|
| `MOVE_FORWARD` | speed 0.0–1.0 | Move forward |
| `MOVE_BACKWARD` | speed 0.0–1.0 | Move backward |
| `TURN_LEFT` | speed 0.0–1.0 | Turn left |
| `TURN_RIGHT` | speed 0.0–1.0 | Turn right |
| `STOP` | — | Stop all motors |
| `EMERGENCY_STOP` | — | Immediate full stop |
| `BUZZER_ON` | — | Activate buzzer |
| `BUZZER_OFF` | — | Deactivate buzzer |
| `LIGHTS_ON` | — | Front LEDs on |
| `LIGHTS_OFF` | — | Front LEDs off |
| `SET_MODE` | `MANUAL`/`AUTONOMOUS` | Change drive mode |

---

## Sensor Notes

### MQ-2 (Smoke / Combustible Gas)
- Output: Analog 0–4095 (ESP32 ADC 12-bit)
- Unit: Raw ADC value + estimated ppm
- **Disclaimer:** Not a calibrated gas meter. Values are relative.
- Future: Replace with MQ-4 (methane), MQ-7 (CO), electrochemical sensors.

### DHT11 (Temperature & Humidity)
- Temperature: °C, range 0–50°C ±2°C
- Humidity: %, range 20–90% RH ±5%

### LDR (Light)
- Output: 0–100% (normalized from ADC)
- 0 = dark (underground), 100 = bright

---

## Sensor Health States

| State | Meaning |
|---|---|
| `ONLINE` | Sensor reading normally |
| `OFFLINE` | Sensor not detected |
| `STALE` | No update > 5 seconds |
| `ERROR` | Invalid/out-of-range reading |

---

## WebSocket Events (Backend → Frontend)

```json
{
  "event": "telemetry",
  "data": { ... telemetry packet ... }
}

{
  "event": "alert",
  "level": "CRITICAL",
  "message": "Smoke level critical in CORRIDOR_B",
  "timestamp": "..."
}

{
  "event": "connection_status",
  "rover_connected": true,
  "rover_id": "ARMOR-01"
}
```
