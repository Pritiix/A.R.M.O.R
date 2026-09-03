/**
 * A.R.M.O.R. — Global State Store (Zustand)
 * Single source of truth for the entire frontend application.
 */

import { create } from 'zustand';
import type {
  TelemetryPacket,
  MissionEvent,
  SensorHealth,
  RoverStatus,
  TelemetryMode,
  SimulationScenario,
  WSConnectionStatus,
} from '../types/telemetry';
import { TELEMETRY_HISTORY_LENGTH, STALE_TIMEOUT_SECONDS } from '../config/constants';

// ─── WebSocket Connection State ───────────────────────────────────────────────

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ConnectionState {
  wsStatus: WSStatus;
  backendOnline: boolean;
  roverConnected: boolean;
  telemetryMode: TelemetryMode;
  currentScenario: SimulationScenario;
  lastConnected: string | null;
}

// ─── Telemetry State ──────────────────────────────────────────────────────────

interface TelemetryState {
  latest: TelemetryPacket | null;
  history: TelemetryPacket[];
  isStale: boolean;
  lastReceivedAt: number | null; // Unix timestamp ms
  packetCount: number;
}

// ─── Mission State ────────────────────────────────────────────────────────────

interface MissionState {
  missionId: string;
  roverId: string;
  missionStartTime: string | null;
  missionEvents: MissionEvent[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────

interface UIState {
  sidebarCollapsed: boolean;
  selectedPage: string;
}

// ─── Full Store ───────────────────────────────────────────────────────────────

interface ARMORStore extends ConnectionState, TelemetryState, MissionState, UIState {
  // Connection actions
  setWSStatus: (status: WSStatus) => void;
  setBackendOnline: (online: boolean) => void;
  setConnectionStatus: (status: WSConnectionStatus) => void;
  setScenario: (scenario: SimulationScenario) => void;
  setTelemetryMode: (mode: TelemetryMode) => void;
  updateTelemetry: (packet: TelemetryPacket) => void;


  // Telemetry actions
  receiveTelemetry: (packet: TelemetryPacket) => void;
  checkStaleness: () => void;

  // Mission actions
  addMissionEvent: (event: MissionEvent) => void;
  setMissionId: (id: string) => void;

  // UI actions
  toggleSidebar: () => void;
  setSelectedPage: (page: string) => void;
}

// ─── Store Implementation ─────────────────────────────────────────────────────

export const useARMORStore = create<ARMORStore>((set, get) => ({
  // Connection defaults
  wsStatus: 'disconnected',
  backendOnline: false,
  roverConnected: false,
  telemetryMode: 'simulation',
  currentScenario: 'NORMAL',
  lastConnected: null,

  // Telemetry defaults
  latest: null,
  history: [],
  isStale: false,
  lastReceivedAt: null,
  packetCount: 0,

  // Mission defaults
  missionId: 'MISSION-001',
  roverId: 'ARMOR-01',
  missionStartTime: null,
  missionEvents: [],

  // UI defaults
  sidebarCollapsed: false,
  selectedPage: 'dashboard',

  // ─── Actions ──────────────────────────────────────────────────────────────

  setWSStatus: (status) => set({ wsStatus: status }),

  setBackendOnline: (online) => set({ backendOnline: online }),

  setConnectionStatus: (status) =>
    set({
      roverConnected: status.rover_connected,
      telemetryMode: status.telemetry_mode,
      currentScenario: status.sim_scenario ?? get().currentScenario,
      lastConnected: new Date().toISOString(),
    }),

  setScenario: (scenario) => set({ currentScenario: scenario }),

  setTelemetryMode: (mode) => set({ telemetryMode: mode }),

  updateTelemetry: (packet) => set({ latest: packet }),


  receiveTelemetry: (packet) =>
    set((state) => {
      const history = [...state.history, packet].slice(-TELEMETRY_HISTORY_LENGTH);
      return {
        latest: packet,
        history,
        isStale: false,
        lastReceivedAt: Date.now(),
        packetCount: state.packetCount + 1,
        missionId: packet.mission_id,
        roverId: packet.rover_id,
        // Set mission start time on first packet
        missionStartTime: state.missionStartTime ?? packet.timestamp,
      };
    }),

  checkStaleness: () => {
    const { lastReceivedAt } = get();
    if (lastReceivedAt === null) return;
    const ageSeconds = (Date.now() - lastReceivedAt) / 1000;
    set({ isStale: ageSeconds > STALE_TIMEOUT_SECONDS });
  },

  addMissionEvent: (event) =>
    set((state) => ({
      missionEvents: [event, ...state.missionEvents].slice(0, 500),
    })),

  setMissionId: (id) => set({ missionId: id }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSelectedPage: (page) => set({ selectedPage: page }),
}));
