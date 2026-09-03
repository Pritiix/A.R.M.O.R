# A.R.M.O.R. — SIH Presentation & Demonstration Guide

## 🏆 Project Overview
**A.R.M.O.R.** (Autonomous Reconnaissance & Mine Operation Rover) is a full-stack robotics and software safety system designed for hazardous underground coal and metal mine reconnaissance.

---

## ⚡ Key Technical USPs for Hackathon Judges

1. **Hardware Abstraction Layer (HAL)**
   - The React Mission Control frontend and FastAPI backend communicate via a canonical `TelemetryPacket` schema.
   - Works seamlessly with both **Physical ESP32 Rover** and the **8-Scenario Simulation Engine**.

2. **100% Offline Capability**
   - No external cloud dependencies or map tiles required. Uses custom vector SVG mine maps and local SQLite database persistence.

3. **Digital Twin Kinematic 3D Viewer**
   - Built with Three.js and WebGL for real-time 3D rover orientation and kinematic visualization.

4. **Multi-Hazard Safety System**
   - Real-time gas hazard detection (MQ-2 raw ADC + calibrated PPM), temperature alerts, and optical AI rockfall detection.

---

## 🚀 Live Demonstration Walkthrough (3-Minute Script)

1. **Start System**:
   - Open Mission Control Dashboard (`http://localhost:5173`).
   - Point out live telemetry streaming, battery %, signal strength, and mission timer.

2. **Simulate Mine Hazards**:
   - In the header dropdown, switch scenario from `NORMAL` to `SMOKE_WARNING` and `SMOKE_CRITICAL`.
   - Show instant visual card hazards, warning banners, gas trend charts, and buzzer triggers.

3. **Teleoperate Rover**:
   - Navigate to **Rover Control** (`/rover-control`).
   - Use **WASD keys** on keyboard to demonstrate real-time motor control and press **E-STOP**.

4. **Show 3D Digital Twin**:
   - Navigate to **3D Viewer** (`/rover-3d`).
   - Rotate the 3D model, toggle CAD wireframe mode, and show live kinematic sync.

5. **Show Offline Map & Logs**:
   - Navigate to **Mine Map** (`/mine-map`) and **Mission Logs** (`/mission-logs`).
