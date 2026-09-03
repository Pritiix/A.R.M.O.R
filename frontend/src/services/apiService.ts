/**
 * A.R.M.O.R. — API Service
 * REST API calls to the FastAPI backend.
 */

import { API_BASE_URL } from '../config/constants';
import type { RoverCommand, SimulationScenario } from '../types/telemetry';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json() as Promise<T>;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

export async function sendCommand(command: RoverCommand): Promise<void> {
  await apiFetch('/api/commands', {
    method: 'POST',
    body: JSON.stringify(command),
  });
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export async function setSimulationScenario(scenario: SimulationScenario): Promise<void> {
  await apiFetch(`/api/simulation/scenario?scenario=${encodeURIComponent(scenario)}`, {
    method: 'POST',
  });
}


export async function getScenarios(): Promise<{ scenarios: SimulationScenario[] }> {
  return apiFetch('/api/simulation/scenarios');
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getMissionEvents(
  missionId?: string,
  limit = 100,
  offset = 0,
): Promise<{ events: unknown[]; count: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (missionId) params.set('mission_id', missionId);
  return apiFetch(`/api/events?${params.toString()}`);
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<{
  status: string;
  telemetry_mode: string;
  ws_clients: number;
}> {
  return apiFetch('/api/health');
}
