# A.R.M.O.R.
## Autonomous Reconnaissance & Mine Operation Rover
### Smart India Hackathon 2025 — Underground Mine Reconnaissance & Safety

---

## Overview

**A.R.M.O.R.** is an autonomous/remote-controlled rover designed for underground mine reconnaissance and safety monitoring. It provides real-time sensor telemetry, live camera vision, gas hazard detection, AI-assisted detection, and a full mission control dashboard — all running **completely offline** after initial setup.

---

## Hardware Prototype

| Component | Purpose |
|---|---|
| ESP32 (30-pin) | Main controller, Wi-Fi, sensor aggregation |
| ESP32-CAM | Live video streaming, AI vision input |
| L298N | Motor driver for 4× BO geared motors |
| 4× BO Geared Motors | Tracked chassis drive |
| MQ-2 | Smoke / combustible gas signal (prototype) |
| DHT11 | Temperature & humidity |
| LDR Module | Ambient light level |
| Buzzer | Audible hazard alert |
| 2× 3V LEDs | Front lighting |

> **⚠️ Sensor Disclaimer:** The MQ-2 sensor used in this prototype detects smoke and combustible gases as a relative analog signal. It does **not** provide certified methane concentration measurements. The software architecture is extensible to support calibrated sensors (MQ-4, MQ-7, electrochemical cells) in future revisions.

---

## Software Stack

### Frontend
- React 18 + Vite + TypeScript (strict)
- Tailwind CSS
- Lucide React (icons)
- Recharts (telemetry charts)
- Three.js + React Three Fiber + Drei (3D rover viewer)

### Backend
- Python 3.11+
- FastAPI
- WebSocket (real-time telemetry)
- Pydantic v2 (schema validation)
- SQLite (local mission/event storage)

### Firmware
- ESP32 Arduino framework
- L298N motor control
- DHT11 / MQ-2 / LDR sensor reading
- Wi-Fi → FastAPI communication

---

## Project Structure

```
ARMOR/
├── README.md
├── .gitignore
├── .env.example
├── docs/               # Architecture, hardware, protocol docs
├── frontend/           # React/Vite/TS dashboard
├── backend/            # FastAPI + WebSocket server
├── firmware/           # ESP32 Arduino firmware
├── simulator/          # Telemetry simulation engine
├── ai/                 # AI/YOLO inference (Phase 11)
└── tests/              # Automated tests
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- pip

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

Backend API: [http://localhost:8000](http://localhost:8000)

WebSocket: `ws://localhost:8000/ws/telemetry`

---

## Telemetry Schema

```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "rover_id": "ARMOR-01",
  "mission_id": "MISSION-001",
  "sensors": {
    "smoke_raw": 120,
    "smoke_ppm": 45.2,
    "temperature": 28.4,
    "humidity": 64.0,
    "light": 70
  },
  "rover": {
    "battery": 74,
    "speed": 0.8,
    "mode": "AUTONOMOUS"
  },
  "communication": {
    "rssi": -70,
    "connected": true
  },
  "sensor_health": {
    "mq2": "ONLINE",
    "dht11": "ONLINE",
    "ldr": "ONLINE",
    "camera": "ONLINE"
  }
}
```

---

## Development Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation: structure, types, FastAPI, WebSocket, simulator | ✅ Complete |
| 2 | Design system: layout, sidebar, header, cards | 🔜 |
| 3 | Main Mission Control dashboard | 🔜 |
| 4 | Telemetry + simulation engine | 🔜 |
| 5 | Rover control | 🔜 |
| 6 | 3D rover viewer | 🔜 |
| 7 | Live Vision | 🔜 |
| 8 | Mission logs / reports | 🔜 |
| 9 | ESP32 integration | 🔜 |
| 10 | ESP32-CAM integration | 🔜 |
| 11 | AI / YOLO integration | 🔜 |
| 12 | Hardware integration testing | 🔜 |

---

## Communication Architecture

```
[ESP32 Rover]
    ↕ Wi-Fi (HTTP/WebSocket)
[FastAPI Backend :8000]
    ↕ WebSocket ws://
[React Dashboard :5173]
```

**Uplink:** ESP32 → FastAPI → WebSocket → React (telemetry)  
**Downlink:** React → FastAPI → HTTP/WS → ESP32 (commands)

---

## Security Notes

- `.env` is **never** committed to Git
- No cloud services, APIs, or remote tiles required
- All data stored locally via SQLite
- Application runs fully offline after `npm install` / `pip install`

---

## License

MIT License — See LICENSE file.

---

## Attribution

This project may incorporate adapted open-source firmware patterns for ESP32 motor control and sensor reading. All third-party code is documented in [`docs/decisions/`](docs/decisions/) with license attribution.
