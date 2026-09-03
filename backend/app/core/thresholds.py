"""
A.R.M.O.R. Backend — Hazard Thresholds Configuration
All thresholds are in ONE place. Never hardcode these in routes or UI logic.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class SmokeThresholds:
    """
    MQ-2 raw ADC thresholds (0-4095, ESP32 12-bit ADC).
    These are prototype thresholds for demonstration only.
    NOT official mining safety standards.
    """
    warning_raw: int = 300
    critical_raw: int = 600
    warning_ppm: float = 50.0
    critical_ppm: float = 150.0


@dataclass(frozen=True)
class TemperatureThresholds:
    """DHT11 temperature in °C."""
    warning: float = 35.0
    critical: float = 45.0


@dataclass(frozen=True)
class HumidityThresholds:
    """DHT11 relative humidity %."""
    warning_high: float = 85.0
    critical_high: float = 95.0


@dataclass(frozen=True)
class BatteryThresholds:
    """Battery percentage."""
    warning: float = 25.0
    critical: float = 10.0


@dataclass(frozen=True)
class RSSIThresholds:
    """Wi-Fi RSSI in dBm. More negative = weaker signal."""
    warning: float = -75.0
    critical: float = -85.0


@dataclass(frozen=True)
class TelemetryThresholds:
    """Aggregated threshold config. Extend here to add new sensors."""
    smoke: SmokeThresholds = SmokeThresholds()
    temperature: TemperatureThresholds = TemperatureThresholds()
    humidity: HumidityThresholds = HumidityThresholds()
    battery: BatteryThresholds = BatteryThresholds()
    rssi: RSSIThresholds = RSSIThresholds()
    # Time (seconds) before telemetry is marked STALE
    stale_timeout_seconds: float = 5.0


THRESHOLDS = TelemetryThresholds()
