/**
 * A.R.M.O.R. — WebSocket Service (TelemetryProvider abstraction)
 * The dashboard NEVER directly depends on WebSocket — it uses this service.
 * Swap this for SimulationTelemetryProvider if running without backend.
 */

import {
  WS_URL,
  WS_RECONNECT_DELAY_MS,
  WS_MAX_RECONNECT_ATTEMPTS,
} from '../config/constants';
import { useARMORStore } from '../store/armorStore';
import type {
  TelemetryPacket,
  WSEvent,
  WSConnectionStatus,
  WSCommandAck,
} from '../types/telemetry';

class WebSocketTelemetryService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private stalenessInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  connect(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this._connect();

    // Check for stale telemetry every 2 seconds
    this.stalenessInterval = setInterval(() => {
      useARMORStore.getState().checkStaleness();
    }, 2000);
  }

  disconnect(): void {
    this.isRunning = false;
    this._cleanup();
    useARMORStore.getState().setWSStatus('disconnected');
  }

  private _connect(): void {
    const store = useARMORStore.getState();
    store.setWSStatus('connecting');

    try {
      this.ws = new WebSocket(WS_URL);
    } catch (err) {
      console.error('[WS] Failed to create WebSocket:', err);
      store.setWSStatus('error');
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[WS] Connected to A.R.M.O.R. backend');
      this.reconnectAttempts = 0;
      useARMORStore.getState().setWSStatus('connected');
      useARMORStore.getState().setBackendOnline(true);

      // Start keepalive ping
      this.pingInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 15000);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as WSEvent;
        this._handleMessage(msg);
      } catch (err) {
        console.warn('[WS] Malformed message:', event.data, err);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WS] WebSocket error:', error);
      useARMORStore.getState().setWSStatus('error');
    };

    this.ws.onclose = (event) => {
      console.warn(`[WS] Disconnected (code=${event.code})`);
      this._cleanup();
      useARMORStore.getState().setWSStatus('disconnected');
      useARMORStore.getState().setBackendOnline(false);

      if (this.isRunning) {
        this._scheduleReconnect();
      }
    };
  }

  private _handleMessage(msg: WSEvent): void {
    const store = useARMORStore.getState();

    switch (msg.event) {
      case 'telemetry':
        store.receiveTelemetry(msg.data as TelemetryPacket);
        break;

      case 'connection_status':
        store.setConnectionStatus(msg.data as WSConnectionStatus);
        break;

      case 'mission_event':
        store.addMissionEvent(msg.data as never);
        break;

      case 'command_ack':
        // Command acknowledged — could trigger UI feedback
        console.log('[WS] Command ack:', (msg.data as WSCommandAck).command);
        break;

      case 'alert':
        console.warn('[WS] Alert:', msg.data);
        break;

      case 'error':
        console.error('[WS] Backend error:', msg.data);
        break;

      default:
        // pong from ping
        break;
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= WS_MAX_RECONNECT_ATTEMPTS) {
      console.error('[WS] Max reconnect attempts reached. Giving up.');
      useARMORStore.getState().setWSStatus('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = WS_RECONNECT_DELAY_MS * Math.min(this.reconnectAttempts, 5);
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.isRunning) {
        this._connect();
      }
    }, delay);
  }

  private _cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      this.ws = null;
    }
  }
}

// Singleton
export const telemetryService = new WebSocketTelemetryService();
