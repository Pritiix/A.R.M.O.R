"""
A.R.M.O.R. Simulator — Telemetry Simulation Engine
Generates realistic telemetry data for all dashboard scenarios.
Runs as a background asyncio task inside FastAPI.
"""
from __future__ import annotations

import asyncio
import logging
import math
import random
from datetime import datetime, timezone

from app.core.config import settings
from app.core.thresholds import THRESHOLDS
from app.schemas.telemetry import (
    CommunicationData,
    HazardLevel,
    MissionEvent,
    PositionData,
    RoverData,
    RoverMode,
    RoverStatus,
    SensorData,
    SensorHealth,
    SensorHealthMap,
    SimulationScenario,
    TelemetryPacket,
    EventType,
)

logger = logging.getLogger(__name__)


class SimulationEngine:
    """
    Generates telemetry for all simulation scenarios.
    Call tick() each interval to get the next TelemetryPacket.
    """

    def __init__(self) -> None:
        self.scenario: SimulationScenario = SimulationScenario(settings.sim_scenario)
        self._sequence: int = 0
        self._tick_count: int = 0

        # Mutable simulated state
        self._battery: float = 87.0
        self._speed: float = 0.6
        self._heading: float = 90.0
        self._pos_x: float = 2.0
        self._pos_y: float = 1.0
        self._smoke_raw: int = 80
        self._temperature: float = 26.5
        self._humidity: float = 62.0
        self._rssi: float = -65.0
        self._mode: RoverMode = RoverMode.MANUAL


    def set_scenario(self, scenario: SimulationScenario) -> None:
        self.scenario = scenario
        logger.info(f"[SIM] Scenario changed to: {scenario.value}")

    def set_mode(self, mode: RoverMode) -> None:
        self.mode = mode
        logger.info(f"[SIM] Rover mode changed to: {mode.value}")

    def handle_command(self, cmd_type: str, value: float | str | None = None) -> None:
        if cmd_type == "SET_MODE":
            if str(value) in ["1", "1.0", "AUTONOMOUS", "AUTO"]:
                self._mode = RoverMode.AUTONOMOUS
            else:
                self._mode = RoverMode.MANUAL
        elif cmd_type == "MOVE_FORWARD":
            self._speed = 0.8
        elif cmd_type == "MOVE_BACKWARD":
            self._speed = -0.5
        elif cmd_type == "STOP" or cmd_type == "EMERGENCY_STOP":
            self._speed = 0.0


    def tick(self) -> TelemetryPacket:
        """Advance the simulation by one tick and return a telemetry packet."""
        self._tick_count += 1
        self._sequence += 1
        t = self._tick_count

        # Slowly drain battery
        self._battery = max(0.0, self._battery - 0.02)

        # Oscillate position along a simple path
        self._pos_x = 2.0 + math.sin(t * 0.05) * 8
        self._pos_y = 1.0 + math.cos(t * 0.03) * 5

        # Sensor base drift
        self._temperature = 26.5 + math.sin(t * 0.02) * 2.0 + random.uniform(-0.3, 0.3)
        self._humidity = 62.0 + math.sin(t * 0.015) * 5.0 + random.uniform(-0.5, 0.5)
        self._light = max(0, min(100, 20 + random.randint(-3, 3)))
        self._rssi = -65.0 + math.sin(t * 0.1) * 8 + random.uniform(-2, 2)

        # Apply scenario overrides
        return self._apply_scenario()

    def _apply_scenario(self) -> TelemetryPacket:
        s = self.scenario

        if s == SimulationScenario.NORMAL:
            return self._build_packet(
                smoke_raw=80 + random.randint(-10, 10),
                smoke_ppm=12.0 + random.uniform(-2, 2),
                smoke_status=HazardLevel.NORMAL,
                battery=self._battery,
                speed=self._speed if self._speed > 0 else 0.6 + random.uniform(-0.05, 0.05),
                mode=self._mode,
                status=RoverStatus.MOVING if self._speed > 0 else RoverStatus.STOPPED,
                rssi=self._rssi,
                connected=True,
                all_sensors_online=True,
            )

        elif s == SimulationScenario.SMOKE_WARNING:
            return self._build_packet(
                smoke_raw=THRESHOLDS.smoke.warning_raw + random.randint(0, 50),
                smoke_ppm=THRESHOLDS.smoke.warning_ppm + random.uniform(0, 20),
                smoke_status=HazardLevel.WARNING,
                battery=self._battery,
                speed=0.3,
                mode=self._mode,
                status=RoverStatus.MOVING,
                rssi=self._rssi,
                connected=True,
                all_sensors_online=True,
            )

        elif s == SimulationScenario.SMOKE_CRITICAL:
            return self._build_packet(
                smoke_raw=THRESHOLDS.smoke.critical_raw + random.randint(0, 200),
                smoke_ppm=THRESHOLDS.smoke.critical_ppm + random.uniform(0, 50),
                smoke_status=HazardLevel.CRITICAL,
                battery=self._battery,
                speed=0.0,
                mode=RoverMode.SAFE,
                status=RoverStatus.STOPPED,
                rssi=self._rssi,
                connected=True,
                all_sensors_online=True,
            )

        elif s == SimulationScenario.LOW_BATTERY:
            low_bat = max(5.0, THRESHOLDS.battery.warning - random.uniform(0, 5))
            return self._build_packet(
                smoke_raw=80,
                smoke_ppm=12.0,
                smoke_status=HazardLevel.NORMAL,
                battery=low_bat,
                speed=0.2,
                mode=self._mode,
                status=RoverStatus.MOVING,
                rssi=self._rssi,
                connected=True,
                all_sensors_online=True,
            )

        elif s == SimulationScenario.WEAK_COMMUNICATION:
            return self._build_packet(
                smoke_raw=80,
                smoke_ppm=12.0,
                smoke_status=HazardLevel.NORMAL,
                battery=self._battery,
                speed=0.4,
                mode=self._mode,
                status=RoverStatus.MOVING,
                rssi=THRESHOLDS.rssi.critical + random.uniform(-5, 5),
                connected=True,
                all_sensors_online=True,
            )

        elif s == SimulationScenario.COMMUNICATION_LOST:
            return self._build_packet(
                smoke_raw=None,
                smoke_ppm=None,
                smoke_status=HazardLevel.NORMAL,
                battery=None,
                speed=None,
                mode=self._mode,
                status=RoverStatus.OFFLINE,
                rssi=None,
                connected=False,
                all_sensors_online=False,
            )

        elif s == SimulationScenario.COMMUNICATION_RESTORED:
            return self._build_packet(
                smoke_raw=85,
                smoke_ppm=14.0,
                smoke_status=HazardLevel.NORMAL,
                battery=self._battery,
                speed=0.5,
                mode=self._mode,
                status=RoverStatus.MOVING,
                rssi=-70.0,
                connected=True,
                all_sensors_online=True,
            )

        elif s == SimulationScenario.PERSON_DETECTED:
            return self._build_packet(
                smoke_raw=90,
                smoke_ppm=15.0,
                smoke_status=HazardLevel.NORMAL,
                battery=self._battery,
                speed=0.0,
                mode=self._mode,
                status=RoverStatus.STOPPED,
                rssi=self._rssi,
                connected=True,
                all_sensors_online=True,
            )


        # Default fallback → NORMAL
        return self._apply_scenario()

    def _build_packet(
        self,
        smoke_raw,
        smoke_ppm,
        smoke_status,
        battery,
        speed,
        mode,
        status,
        rssi,
        connected,
        all_sensors_online,
    ) -> TelemetryPacket:
        health = SensorHealth.ONLINE if all_sensors_online else SensorHealth.OFFLINE

        # Determine zone from position
        if self._pos_x < 5:
            zone = "CORRIDOR_A"
        elif self._pos_x < 12:
            zone = "CORRIDOR_B"
        else:
            zone = "JUNCTION_1"

        return TelemetryPacket(
            timestamp=datetime.now(timezone.utc),
            rover_id=settings.rover_id,
            mission_id=settings.mission_id,
            sequence=self._sequence,
            sensors=SensorData(
                smoke_raw=smoke_raw,
                smoke_ppm=smoke_ppm,
                smoke_status=smoke_status,
                temperature=round(self._temperature, 1) if all_sensors_online else None,
                humidity=round(max(0, min(100, self._humidity)), 1) if all_sensors_online else None,
                light=self._light if all_sensors_online else None,
            ),
            rover=RoverData(
                battery=round(battery, 1) if battery is not None else None,
                speed=round(speed, 2) if speed is not None else None,
                heading=round(self._heading, 1),
                mode=mode,
                status=status,
            ),
            communication=CommunicationData(
                rssi=round(rssi, 1) if rssi is not None else None,
                packet_rate=10.0 if connected else 0.0,
                packet_loss=0.0 if connected else 100.0,
                latency_ms=random.uniform(8, 25) if connected else None,
                connected=connected,
            ),
            sensor_health=SensorHealthMap(
                mq2=health,
                dht11=health,
                ldr=health,
                camera=health,
                esp32=SensorHealth.ONLINE if connected else SensorHealth.OFFLINE,
            ),
            position=PositionData(
                x=round(self._pos_x, 2),
                y=round(self._pos_y, 2),
                zone=zone if connected else "UNKNOWN",
            ),
            sim_scenario=self.scenario.value,
        )


# ─── Background Simulation Loop ───────────────────────────────────────────────

# Import here to avoid circular import at module level
_engine: SimulationEngine | None = None


def get_engine() -> SimulationEngine:
    global _engine
    if _engine is None:
        _engine = SimulationEngine()
    return _engine


async def simulation_loop(broadcast_fn) -> None:
    """
    Runs as a background asyncio task.
    Calls broadcast_fn(packet) at each tick.
    """
    engine = get_engine()
    interval = settings.sim_tick_interval_ms / 1000.0
    logger.info(f"[SIM] Simulation loop started. Scenario={engine.scenario}, interval={interval}s")

    while True:
        try:
            if settings.telemetry_mode == "simulation":
                packet = engine.tick()
                await broadcast_fn(packet)
        except asyncio.CancelledError:
            logger.info("[SIM] Simulation loop cancelled.")
            break
        except Exception as exc:
            logger.error(f"[SIM] Error in simulation loop: {exc}")
        await asyncio.sleep(interval)
