import { useARMORStore } from '../store/armorStore'
import { Radio, Wifi, Server, Cpu, RefreshCw, Zap } from 'lucide-react'
import { Card, Badge, MetricDisplay, StatusIndicator } from '../components/ui'

export function Communication() {
  const latest = useARMORStore((s) => s.latest)
  const wsStatus = useARMORStore((s) => s.wsStatus)
  const packetCount = useARMORStore((s) => s.packetCount)
  const isStale = useARMORStore((s) => s.isStale)
  const telemetryMode = useARMORStore((s) => s.telemetryMode)

  const c = latest?.communication

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Communication Subsystem & Network Diagnostics
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            Wi-Fi / WebSocket Link Statistics & Multi-Hop Relay Node Health
          </p>
        </div>
        <Badge variant={wsStatus === 'connected' ? 'online' : 'offline'} pulse>
          {wsStatus.toUpperCase()}
        </Badge>
      </div>

      {/* Network Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card title="WEBSOCKET LINK" icon={Wifi}>
          <MetricDisplay
            label="Backend Status"
            value={wsStatus.toUpperCase()}
            color={wsStatus === 'connected' ? '#22c55e' : '#6b7280'}
          />
        </Card>
        <Card title="SIGNAL STRENGTH" icon={Radio}>
          <MetricDisplay
            label="Wi-Fi RSSI"
            value={c?.rssi?.toFixed(0) ?? null}
            unit="dBm"
            color={c?.rssi && c.rssi > -75 ? '#22c55e' : '#f59e0b'}
          />
        </Card>
        <Card title="TOTAL PACKETS RX" icon={RefreshCw}>
          <MetricDisplay
            label="Received Count"
            value={packetCount}
            color="#1D8CF8"
          />
        </Card>
        <Card title="TELEMETRY SOURCE" icon={Server}>
          <MetricDisplay
            label="Current Mode"
            value={telemetryMode.toUpperCase()}
            color="#f59e0b"
          />
        </Card>
      </div>

      {/* Connection Protocol Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="LINK PROTOCOL ARCHITECTURE">
          <div className="space-y-3 py-1 font-mono text-xs text-armor-text-secondary">
            <div className="flex justify-between items-center py-1 border-b border-armor-border">
              <span className="text-armor-text-dim">Protocol:</span>
              <span className="text-armor-text-primary font-bold">WebSocket (JSON Telemetry)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-armor-border">
              <span className="text-armor-text-dim">Endpoint URL:</span>
              <span className="text-armor-primary font-bold">ws://localhost:8000/ws/telemetry</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-armor-border">
              <span className="text-armor-text-dim">Stale Timeout:</span>
              <span className="text-armor-text-primary">5,000 ms</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-armor-border">
              <span className="text-armor-text-dim">Auto-Reconnect:</span>
              <span className="text-emerald-400 font-bold">ENABLED (3s interval)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-armor-text-dim">Packet Integrity:</span>
              <span className="text-emerald-400 font-bold">CRC / Sequence Checked</span>
            </div>
          </div>
        </Card>

        <Card title="UNDERGROUND RELAY MESH NODES">
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
              <div className="flex items-center gap-2">
                <StatusIndicator status="online" />
                <span className="font-mono text-xs font-bold text-armor-text-primary">NODE-01 (Pit Entrance)</span>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold">-54 dBm</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
              <div className="flex items-center gap-2">
                <StatusIndicator status="online" />
                <span className="font-mono text-xs font-bold text-armor-text-primary">NODE-02 (Corridor A Junction)</span>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold">-62 dBm</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
              <div className="flex items-center gap-2">
                <StatusIndicator status="warning" />
                <span className="font-mono text-xs font-bold text-armor-text-primary">NODE-03 (Corridor B Deep Shaft)</span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold">-81 dBm</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
