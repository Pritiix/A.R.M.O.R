/**
 * A.R.M.O.R. — Centralized Frontend Configuration
 * All configuration values in ONE place. Never hardcode these elsewhere.
 */

// ─── Backend Connection ───────────────────────────────────────────────────────

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const WS_URL =
  import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/telemetry';

// ─── Rover Identity ───────────────────────────────────────────────────────────

export const ROVER_ID = 'ARMOR-01';
export const MISSION_ID = 'MISSION-001';
export const ROVER_MODEL = 'ARMOR MK-I';

// ─── Telemetry ────────────────────────────────────────────────────────────────

/** How many seconds before telemetry is considered STALE */
export const STALE_TIMEOUT_SECONDS = 5;

/** How many data points to keep in the telemetry history chart */
export const TELEMETRY_HISTORY_LENGTH = 60;

/** WebSocket reconnect delay in ms */
export const WS_RECONNECT_DELAY_MS = 3000;

/** Maximum reconnect attempts before showing permanent error */
export const WS_MAX_RECONNECT_ATTEMPTS = 10;

// ─── Hazard Thresholds ────────────────────────────────────────────────────────
// Mirror of backend/app/core/thresholds.py
// ⚠️ These are prototype thresholds — NOT official mining safety standards.

export const THRESHOLDS = {
  smoke: {
    warningRaw: 300,
    criticalRaw: 600,
    warningPpm: 50.0,
    criticalPpm: 150.0,
  },
  temperature: {
    warning: 35.0,   // °C
    critical: 45.0,
  },
  humidity: {
    warningHigh: 85.0,  // %RH
    criticalHigh: 95.0,
  },
  battery: {
    warning: 25.0,  // %
    critical: 10.0,
  },
  rssi: {
    warning: -75.0,  // dBm
    critical: -85.0,
  },
} as const;

// ─── Simulation Scenarios ─────────────────────────────────────────────────────

export const SIMULATION_SCENARIOS = [
  { value: 'NORMAL', label: 'Normal Operations' },
  { value: 'SMOKE_WARNING', label: 'Smoke Warning' },
  { value: 'SMOKE_CRITICAL', label: 'Smoke Critical' },
  { value: 'PERSON_DETECTED', label: 'Person Detected' },
  { value: 'WEAK_COMMUNICATION', label: 'Weak Communication' },
  { value: 'LOW_BATTERY', label: 'Low Battery' },
  { value: 'COMMUNICATION_LOST', label: 'Communication Lost' },
  { value: 'COMMUNICATION_RESTORED', label: 'Communication Restored' },
] as const;

// ─── Status Colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS = {
  ONLINE: '#22c55e',    // green
  OFFLINE: '#6b7280',   // grey
  STALE: '#f59e0b',     // amber
  ERROR: '#ef4444',     // red
  NORMAL: '#22c55e',    // green
  WARNING: '#f59e0b',   // amber
  CRITICAL: '#ef4444',  // red
  MOVING: '#3b82f6',    // blue
  STOPPED: '#6b7280',   // grey
  MANUAL: '#60a5fa',
  AUTONOMOUS: '#a78bfa',
  SAFE: '#f59e0b',
} as const;
