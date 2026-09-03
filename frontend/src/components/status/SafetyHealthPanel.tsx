/**
 * SafetyHealthPanel — matches the "SAFETY & HEALTH" card in the reference image
 */
import { Shield, AlertTriangle, ChevronRight } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'
import { useNavigate } from 'react-router-dom'
import { THRESHOLDS } from '../../config/constants'

interface HealthRowProps {
  label: string
  value: string
  status: 'good' | 'warning' | 'critical' | 'offline'
  note?: string
}

function HealthRow({ label, value, status, note }: HealthRowProps) {
  const color = status === 'good' ? '#22c55e' : status === 'warning' ? '#f59e0b' : status === 'critical' ? '#ef4444' : '#6b7280'
  const dotStyle = {
    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
    background: color,
    boxShadow: status !== 'offline' ? `0 0 5px ${color}` : undefined,
  }

  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(30,45,61,0.5)' }}>
      <div className="flex items-center gap-2">
        <div style={dotStyle} />
        <span className="text-armor-text-secondary font-mono text-[11px]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {note && <span className="font-mono text-[10px] text-armor-text-dim">{note}</span>}
        <span className="font-semibold text-[11px] tracking-wide" style={{ color }}>{value}</span>
      </div>
    </div>
  )
}

export function SafetyHealthPanel() {
  const latest = useARMORStore((s) => s.latest)
  const navigate = useNavigate()

  const battery = latest?.rover?.battery ?? null
  const smokeStatus = latest?.sensors?.smoke_status ?? 'NORMAL'
  const temp = latest?.sensors?.temperature ?? null
  const rssi = latest?.communication?.rssi ?? null
  const health = latest?.sensor_health

  const batteryStatus = battery === null ? 'offline' : battery < 10 ? 'critical' : battery < 25 ? 'warning' : 'good'
  const smokeStatusMap = { NORMAL: 'good', WARNING: 'warning', CRITICAL: 'critical' } as const
  const tempStatus = temp === null ? 'offline' : temp > 45 ? 'critical' : temp > 35 ? 'warning' : 'good'
  const commStatus = rssi === null ? 'offline' : rssi < THRESHOLDS.rssi.critical ? 'critical' : rssi < THRESHOLDS.rssi.warning ? 'warning' : 'good'

  const hasAlert = smokeStatus !== 'NORMAL' || battery !== null && battery < 25 || temp !== null && temp > 35

  return (
    <div className={`armor-card h-full flex flex-col ${smokeStatus === 'CRITICAL' ? 'hazard-critical' : smokeStatus === 'WARNING' ? 'hazard-warning' : ''}`}>
      <div className="armor-card-header">
        <Shield size={12} style={{ color: hasAlert ? '#f59e0b' : '#22c55e' }} />
        <span className="armor-card-title">SAFETY & HEALTH</span>
        {hasAlert && (
          <div className="ml-auto flex items-center gap-1">
            <AlertTriangle size={10} className="text-amber-400" />
            <span className="font-mono text-[10px] text-amber-400">ALERT</span>
          </div>
        )}
      </div>

      <div className="flex-1 px-3 py-1 overflow-hidden">
        <HealthRow
          label="Structural Health"
          value="GOOD"
          status="good"
        />
        <HealthRow
          label="Motors"
          value={health?.esp32 === 'ONLINE' ? 'GOOD' : 'OFFLINE'}
          status={health?.esp32 === 'ONLINE' ? 'good' : 'offline'}
        />
        <HealthRow
          label="Sensors"
          value={health?.mq2 === 'ONLINE' ? 'ACTIVE' : 'INACTIVE'}
          status={health?.mq2 === 'ONLINE' ? 'good' : 'offline'}
        />
        <HealthRow
          label="Communication"
          value={commStatus === 'good' ? 'STRONG' : commStatus === 'warning' ? 'WEAK' : commStatus === 'critical' ? 'POOR' : 'OFFLINE'}
          status={commStatus}
        />
        <HealthRow
          label="Gas Level"
          value={smokeStatus}
          status={smokeStatusMap[smokeStatus] ?? 'good'}
        />
        <HealthRow
          label="Temperature"
          value={temp !== null ? `${temp.toFixed(1)} °C` : '--'}
          status={tempStatus}
        />
        <HealthRow
          label="Battery"
          value={battery !== null ? `${battery.toFixed(0)}%` : '--'}
          status={batteryStatus}
        />
      </div>

      <button
        onClick={() => navigate('/telemetry')}
        className="flex items-center justify-between px-3 py-2 border-t border-armor-border hover:bg-armor-surface transition-colors"
        style={{ fontSize: 10 }}
      >
        <span className="font-mono text-armor-primary tracking-wider uppercase">View Incident Details</span>
        <ChevronRight size={11} className="text-armor-primary" />
      </button>
    </div>
  )
}
