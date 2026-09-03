/**
 * A.R.M.O.R. — Canonical TypeScript Telemetry Types
 * These MUST mirror the Pydantic schemas in backend/app/schemas/telemetry.py
 * ONE source of truth: any change here must reflect in the backend.
 */

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type SensorHealth = 'ONLINE' | 'OFFLINE' | 'STALE' | 'ERROR';

export type HazardLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export type RoverMode = 'MANUAL' | 'AUTONOMOUS' | 'SAFE' | 'STOPPED';

export type RoverStatus = 'ONLINE' | 'OFFLINE' | 'MOVING' | 'STOPPED' | 'ERROR';

export type CommandType =
  | 'MOVE_FORWARD'
  | 'MOVE_BACKWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'STOP'
  | 'EMERGENCY_STOP'
  | 'BUZZER_ON'
  | 'BUZZER_OFF'
  | 'LIGHTS_ON'
  | 'LIGHTS_OFF'
  | 'SET_MODE';

export type TelemetryMode = 'simulation' | 'live';

export type SimulationScenario =
  | 'NORMAL'
  | 'SMOKE_WARNING'
  | 'SMOKE_CRITICAL'
  | 'PERSON_DETECTED'
  | 'WEAK_COMMUNICATION'
  | 'LOW_BATTERY'
  | 'COMMUNICATION_LOST'
  | 'COMMUNICATION_RESTORED';

// ─── Telemetry Sub-Types ──────────────────────────────────────────────────────

export interface SensorData {
  /** MQ-2 raw ADC value (0–4095). Prototype only — NOT certified gas measurement. */
  smoke_raw: number | null;
  smoke_ppm: number | null;
  smoke_status: HazardLevel;
  temperature: number | null; // °C
  humidity: number | null;    // %RH
  light: number | null;       // 0–100%
  light_status: HazardLevel;
}

export interface RoverData {
  battery: number | null;  // %
  speed: number | null;    // m/s
  heading: number | null;  // degrees
  mode: RoverMode;
  status: RoverStatus;
}

export interface CommunicationData {
  rssi: number | null;        // dBm
  packet_rate: number | null; // packets/s
  packet_loss: number | null; // %
  latency_ms: number | null;  // ms
  connected: boolean;
}

export interface SensorHealthMap {
  mq2: SensorHealth;
  dht11: SensorHealth;
  ldr: SensorHealth;
  camera: SensorHealth;
  esp32: SensorHealth;
}

export interface PositionData {
  x: number;
  y: number;
  zone: string;
}

// ─── Canonical Telemetry Packet ───────────────────────────────────────────────

export interface TelemetryPacket {
  timestamp: string;       // ISO 8601
  rover_id: string;
  mission_id: string;
  sequence: number;
  sensors: SensorData;
  rover: RoverData;
  communication: CommunicationData;
  sensor_health: SensorHealthMap;
  position: PositionData;
  sim_scenario?: SimulationScenario | null;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

export interface RoverCommand {
  command: CommandType;
  value?: number | null;
  issued_by?: string;
  timestamp?: string;
}

// ─── Mission Events ───────────────────────────────────────────────────────────

export type EventType =
  | 'MISSION_STARTED'
  | 'MISSION_PAUSED'
  | 'MISSION_ENDED'
  | 'SMOKE_WARNING'
  | 'SMOKE_CRITICAL'
  | 'PERSON_DETECTED'
  | 'ROVER_COMMAND'
  | 'COMMUNICATION_LOST'
  | 'COMMUNICATION_RESTORED'
  | 'LOW_BATTERY'
  | 'SENSOR_ERROR'
  | 'SYSTEM';

export interface MissionEvent {
  id?: number;
  mission_id: string;
  rover_id: string;
  timestamp: string;
  event_type: EventType;
  description: string;
  severity: HazardLevel;
  zone?: string | null;
  metadata?: Record<string, unknown> | null;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export type WSEventType =
  | 'telemetry'
  | 'alert'
  | 'connection_status'
  | 'mission_event'
  | 'command_ack'
  | 'error';

export interface WSEvent<T = unknown> {
  event: WSEventType;
  data: T;
  timestamp: string;
}

export interface WSConnectionStatus {
  rover_connected: boolean;
  rover_id: string;
  mission_id: string;
  telemetry_mode: TelemetryMode;
  client_id?: string;
  sim_scenario?: SimulationScenario;
}

export interface WSCommandAck {
  command: CommandType;
  value: number | null;
  status: string;
}
