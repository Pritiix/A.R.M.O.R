# A.R.M.O.R. System Architecture

## Overview

A.R.M.O.R. follows a three-tier architecture:
1. **Firmware** — ESP32 hardware layer
2. **Backend** — FastAPI server (Python)
3. **Frontend** — React dashboard (TypeScript)

## Layers

```
┌─────────────────────────────────────────────────┐
│               REACT DASHBOARD                    │
│  Mission Control UI  |  3D Viewer  |  Map        │
│  Telemetry Charts    |  Controls   |  Reports    │
└──────────────────────┬──────────────────────────┘
                       │ WebSocket / HTTP
┌──────────────────────▼──────────────────────────┐
│              FASTAPI BACKEND                     │
│  WebSocket Manager  |  REST API  |  Scheduler    │
│  Telemetry Router   |  DB Layer  |  Simulator    │
└──────────────────────┬──────────────────────────┘
                       │ Wi-Fi (HTTP/WS)
┌──────────────────────▼──────────────────────────┐
│              ESP32 ROVER (Firmware)              │
│  Sensors: MQ-2, DHT11, LDR                      │
│  Motors: 4× BO via L298N                        │
│  Camera: ESP32-CAM                              │
└─────────────────────────────────────────────────┘
```

## Telemetry Provider Abstraction

The dashboard does NOT directly depend on hardware or simulation.
A `TelemetryProvider` interface abstracts the source:

```
TelemetryProvider (interface)
├── SimulationTelemetryProvider (Phase 1-8)
├── WebSocketTelemetryProvider  (Phase 9+)
└── (Future) LoRaTelemetryProvider
```

This means the UI can be developed and tested in simulation mode,
then switched to real hardware by changing the provider — without
rewriting any dashboard components.

## Key Design Decisions

- **Offline-first**: No cloud services. SQLite for local storage.
- **Schema-first**: One canonical Pydantic/TypeScript telemetry type shared across all layers.
- **Extensible sensors**: Sensor registry pattern allows adding MQ-4, MQ-7, electrochemical sensors later.
- **No Node backend**: Python/FastAPI is the sole backend.

## Component Responsibilities

| Component | Responsibility |
|---|---|
| `frontend/src/types/` | TypeScript telemetry/command types |
| `frontend/src/services/` | WebSocket client, API calls |
| `frontend/src/store/` | Global state (Zustand) |
| `frontend/src/components/` | Reusable UI components |
| `frontend/src/pages/` | Route-level pages |
| `backend/app/schemas/` | Pydantic telemetry models |
| `backend/app/services/` | Business logic |
| `backend/app/api/routes/` | REST endpoints |
| `backend/app/websocket.py` | WebSocket manager |
| `backend/app/database/` | SQLite CRUD layer |
| `simulator/` | Simulation engine |
| `firmware/` | ESP32 Arduino code |
