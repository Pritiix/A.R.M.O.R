/**
 * GasReadingsPanel — matches the "GAS READINGS" card in the reference image
 * Shows smoke/gas levels with sparklines and status dots.
 * ⚠️ MQ-2 values are prototype readings — NOT certified measurements.
 */
import { Flame, ChevronRight } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'
import { MiniSparkline } from '../charts/MiniSparkline'
import { useNavigate } from 'react-router-dom'

interface GasRowProps {
  label: string
  value: string | number | null
  unit: string
  status: 'normal' | 'warning' | 'critical'
  getValue?: (p: any) => number | null | undefined
}

function GasRow({ label, value, unit, status, getValue }: GasRowProps) {
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#22c55e'
  const dotStyle = {
    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
    background: color, boxShadow: `0 0 5px ${color}`,
    animation: status === 'critical' ? 'pulse 1s ease-in-out infinite' : undefined,
  }

  return (
    <div
      className="flex items-center gap-2 py-2"
      style={{ borderBottom: '1px solid rgba(30,45,61,0.5)' }}
    >
      <div className="w-8 font-mono text-[11px] font-semibold text-armor-text-secondary flex-shrink-0">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5 flex-1">
        <span
          className="font-mono font-bold"
          style={{ fontSize: 15, color: status === 'normal' ? '#E8EDF2' : color }}
        >
          {value !== null && value !== undefined ? value : '--'}
        </span>
        <span className="font-mono text-[10px] text-armor-text-dim ml-1">{unit}</span>
      </div>
      {getValue && (
        <MiniSparkline getValue={getValue} color={color} width={52} height={22} />
      )}
      <div style={dotStyle} />
    </div>
  )
}

export function GasReadingsPanel() {
  const latest = useARMORStore((s) => s.latest)
  const navigate = useNavigate()

  const smokeRaw = latest?.sensors?.smoke_raw ?? null
  const smokePpm = latest?.sensors?.smoke_ppm ?? null
  const smokeStatus = latest?.sensors?.smoke_status ?? 'NORMAL'

  const mapStatus = (s: string) => s === 'CRITICAL' ? 'critical' : s === 'WARNING' ? 'warning' : 'normal'

  return (
    <div className={`armor-card h-full flex flex-col ${smokeStatus === 'CRITICAL' ? 'hazard-critical' : smokeStatus === 'WARNING' ? 'hazard-warning' : ''}`}>
      <div className="armor-card-header">
        <Flame size={12} style={{ color: smokeStatus === 'CRITICAL' ? '#ef4444' : smokeStatus === 'WARNING' ? '#f59e0b' : '#f59e0b' }} />
        <span className="armor-card-title">GAS READINGS</span>
        {smokeStatus !== 'NORMAL' && (
          <span
            className="ml-auto font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
            style={{
              color: smokeStatus === 'CRITICAL' ? '#ef4444' : '#f59e0b',
              background: smokeStatus === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${smokeStatus === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}
          >
            {smokeStatus}
          </span>
        )}
      </div>

      <div className="flex-1 px-3 overflow-hidden">
        {/* MQ-2 Smoke Raw */}
        <GasRow
          label="MQ-2"
          value={smokeRaw}
          unit="ADC"
          status={mapStatus(smokeStatus)}
          getValue={(p) => p.sensors?.smoke_raw}
        />

        {/* Estimated PPM */}
        <GasRow
          label="PPM"
          value={smokePpm?.toFixed(1) ?? null}
          unit="est."
          status={mapStatus(smokeStatus)}
          getValue={(p) => p.sensors?.smoke_ppm}
        />

        {/* Placeholder future sensors */}
        <GasRow
          label="CO"
          value="--"
          unit="ppm"
          status="normal"
        />
        <GasRow
          label="O₂"
          value="--"
          unit="%"
          status="normal"
        />

        {/* Disclaimer */}
        <div className="py-2">
          <p className="font-mono text-[9px] text-armor-text-dim leading-relaxed">
            ⚠ MQ-2 prototype readings. Not certified measurements.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/gas-monitoring')}
        className="flex items-center justify-between px-3 py-2 border-t border-armor-border hover:bg-armor-surface transition-colors"
        style={{ fontSize: 10 }}
      >
        <span className="font-mono text-armor-primary tracking-wider uppercase">View History</span>
        <ChevronRight size={11} className="text-armor-primary" />
      </button>
    </div>
  )
}
