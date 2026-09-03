"""
A.R.M.O.R. Backend — Core Configuration
Loads settings from .env file. Never hardcode secrets here.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    backend_host: str = Field(default="0.0.0.0")
    backend_port: int = Field(default=8000)
    backend_reload: bool = Field(default=True)

    # Database
    database_url: str = Field(default="sqlite+aiosqlite:///./armor_local.db")

    # Telemetry
    telemetry_mode: str = Field(default="simulation")  # simulation | live

    # Simulation
    sim_tick_interval_ms: int = Field(default=1000)
    sim_scenario: str = Field(default="NORMAL")

    # CORS — allow the Vite dev server
    allowed_origins: list[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"]
    )

    # Rover identity (overridden by ESP32 in live mode)
    rover_id: str = Field(default="ARMOR-01")
    mission_id: str = Field(default="MISSION-001")


# Single global instance
settings = Settings()
