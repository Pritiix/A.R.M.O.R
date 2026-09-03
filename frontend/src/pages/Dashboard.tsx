import { useARMORStore } from '../store/armorStore'
import { useNavigate } from 'react-router-dom'
import {
  Battery, Wifi, Shield, AlertTriangle, Camera,
  ChevronRight, MapPin, Activity, Thermometer,
  Droplets, Eye, Zap, Brain, Wind, Navigation
} from 'lucide-react'
import { MiniSparkline } from '../components/charts/MiniSparkline'
import { MineMapSVG } from '../components/maps/MineMapSVG'
import { RoverControlPad } from '../components/rover/RoverControlPad'
import { GasReadingsPanel } from '../components/status/GasReadingsPanel'
import { LiveVisionPanel } from '../components/vision/LiveVisionPanel'
import { MissionEventsPanel } from '../components/mission/MissionEventsPanel'
import { SafetyHealthPanel } from '../components/status/SafetyHealthPanel'
import { AIDetectionPanel } from '../components/status/AIDetectionPanel'
import { TelemetryBar } from '../components/charts/TelemetryBar'

export function Dashboard() {
  const latest = useARMORStore((s) => s.latest)
  const isStale = useARMORStore((s) => s.isStale)
  const navigate = useNavigate()

  return (
    <div
      className="h-full overflow-hidden"
      style={{ background: '#0B1117', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 0 }}
    >
      {/* Stale Banner */}
      {isStale && (
        <div className="telemetry-stale-banner flex items-center justify-center gap-2 py-1">
          <AlertTriangle size={11} />
          TELEMETRY STALE — CHECK CONNECTION
        </div>
      )}

      {/* Main Grid */}
      <div
        className="flex-1 overflow-hidden p-3"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.8fr 1.6fr 1.4fr',
          gridTemplateRows: '1fr 1fr',
          gap: 8,
          height: 'calc(100vh - 56px - 52px)',
        }}
      >
        {/* ── Col 1 Row 1: Live Vision ──────────────────────────────────── */}
        <div style={{ gridColumn: 1, gridRow: 1 }}>
          <LiveVisionPanel onExpand={() => navigate('/live-vision')} />
        </div>

        {/* ── Col 2 Row 1: Rover Control ────────────────────────────────── */}
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <RoverControlPad />
        </div>

        {/* ── Col 3 Row 1: Safety & Health ─────────────────────────────── */}
        <div style={{ gridColumn: 3, gridRow: 1 }}>
          <SafetyHealthPanel />
        </div>

        {/* ── Col 4 Row 1: Gas Readings ─────────────────────────────────── */}
        <div style={{ gridColumn: 4, gridRow: 1 }}>
          <GasReadingsPanel />
        </div>

        {/* ── Col 1 Row 2: Mission Events ───────────────────────────────── */}
        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <MissionEventsPanel />
        </div>

        {/* ── Col 2 Row 2: AI Detection (spans rest of row with map) ────── */}
        <div style={{ gridColumn: 2, gridRow: 2 }}>
          <AIDetectionPanel />
        </div>

        {/* ── Col 3-4 Row 2: Mine Map ───────────────────────────────────── */}
        <div style={{ gridColumn: '3 / 5', gridRow: 2 }}>
          <MineMapSVG onExpand={() => navigate('/mine-map')} />
        </div>
      </div>

      {/* ── Bottom: Telemetry Bar ─────────────────────────────────────── */}
      <TelemetryBar />
    </div>
  )
}
