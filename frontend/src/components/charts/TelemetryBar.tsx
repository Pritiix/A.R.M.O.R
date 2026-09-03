/**
 * TelemetryBar — bottom strip showing all sensor values with sparklines
 * Matches the reference image "ROVER TELEMETRY" bar at the bottom
 */
import { useARMORStore } from '../../store/armorStore'
import { MiniSparkline } from './MiniSparkline'
import { Battery, Activity, Thermometer, Droplets, Wind, Zap } from 'lucide-react'

interface TelemetryMetricProps {
  label: string
  value: string | number | null
  unit: string
  color?: string
  sparkColor?: string
  getValue?: (p: any) => number | null | undefined
  warning?: boolean
  critical?: boolean
}

function TelemetryMetric({ label, value, unit, color, sparkColor, getValue, warning, critical }: TelemetryMetricProps) {
  const borderColor = critical ? 'rgba(239,68,68,0.3)' : warning ? 'rgba(245,158,11,0.3)' : 'rgba(30,45,61,0.8)'

  return (
    <div
      className="flex flex-col gap-1 px-3 py-2 flex-1 min-w-0"
      style={{ borderLeft: `1px solid ${borderColor}` }}
    >
      <div className="metric-label" style={{ fontSize: 9 }}>{label}</div>
      <div className="flex items-end justify-between gap-1">
        <div className="flex items-baseline gap-0.5">
          <span
            className="font-mono font-semibold"
            style={{
              fontSize: 16,
              color: critical ? '#ef4444' : warning ? '#f59e0b' : (color ?? '#E8EDF2'),
              lineHeight: 1,
            }}
          >
            {value !== null && value !== undefined ? value : '--'}
          </span>
          <span className="font-mono text-armor-text-dim" style={{ fontSize: 10 }}>{unit}</span>
        </div>
        {getValue && (
          <MiniSparkline
            getValue={getValue}
            color={critical ? '#ef4444' : warning ? '#f59e0b' : (sparkColor ?? '#1D8CF8')}
            width={48}
            height={22}
          />
        )}
      </div>
    </div>
  )
}

export function TelemetryBar() {
  const latest = useARMORStore((s) => s.latest)
  const s = latest?.sensors
  const r = latest?.rover

  const battery = r?.battery ?? null
  const speed = r?.speed ?? null
  const temp = s?.temperature ?? null
  const smokeRaw = s?.smoke_raw ?? null
  const smokePpm = s?.smoke_ppm ?? null
  const humidity = s?.humidity ?? null
  const light = s?.light ?? null
  const smokeStatus = s?.smoke_status ?? 'NORMAL'

  return (
    <div
      className="flex items-stretch flex-shrink-0"
      style={{
        height: 56,
        background: '#0D1620',
        borderTop: '1px solid #1E2D3D',
      }}
    >
      {/* Label */}
      <div
        className="flex items-center px-3 flex-shrink-0"
        style={{ borderRight: '1px solid #1E2D3D' }}
      >
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-armor-primary" />
          <div>
            <div className="armor-card-title" style={{ fontSize: 9, lineHeight: 1 }}>ROVER</div>
            <div className="armor-card-title" style={{ fontSize: 9, lineHeight: 1 }}>TELEMETRY</div>
          </div>
        </div>
      </div>

      <TelemetryMetric
        label="BATTERY"
        value={battery?.toFixed(0) ?? null}
        unit="%"
        color="#22c55e"
        sparkColor="#22c55e"
        critical={battery !== null && battery < 10}
        warning={battery !== null && battery < 25}
        getValue={(p) => p.rover?.battery}
      />
      <TelemetryMetric
        label="SPEED"
        value={speed?.toFixed(2) ?? null}
        unit="m/s"
        sparkColor="#1D8CF8"
        getValue={(p) => p.rover?.speed}
      />
      <TelemetryMetric
        label="TEMPERATURE"
        value={temp?.toFixed(1) ?? null}
        unit="°C"
        color={temp !== null && temp > 35 ? '#f59e0b' : undefined}
        sparkColor="#f59e0b"
        warning={temp !== null && temp > 35}
        critical={temp !== null && temp > 45}
        getValue={(p) => p.sensors?.temperature}
      />
      <TelemetryMetric
        label="GAS (RAW)"
        value={smokeRaw ?? null}
        unit="ADC"
        sparkColor={smokeStatus === 'CRITICAL' ? '#ef4444' : smokeStatus === 'WARNING' ? '#f59e0b' : '#22c55e'}
        critical={smokeStatus === 'CRITICAL'}
        warning={smokeStatus === 'WARNING'}
        getValue={(p) => p.sensors?.smoke_raw}
      />
      <TelemetryMetric
        label="GAS (PPM)"
        value={smokePpm?.toFixed(1) ?? null}
        unit="ppm"
        sparkColor={smokeStatus === 'CRITICAL' ? '#ef4444' : smokeStatus === 'WARNING' ? '#f59e0b' : '#22c55e'}
        critical={smokeStatus === 'CRITICAL'}
        warning={smokeStatus === 'WARNING'}
        getValue={(p) => p.sensors?.smoke_ppm}
      />
      <TelemetryMetric
        label="HUMIDITY"
        value={humidity?.toFixed(1) ?? null}
        unit="%"
        sparkColor="#00B4D8"
        getValue={(p) => p.sensors?.humidity}
      />
      <TelemetryMetric
        label="LIGHT"
        value={light ?? null}
        unit="%"
        sparkColor="#a78bfa"
        getValue={(p) => p.sensors?.light}
      />
      <TelemetryMetric
        label="SIGNAL"
        value={latest?.communication?.rssi?.toFixed(0) ?? null}
        unit="dBm"
        sparkColor="#00B4D8"
        getValue={(p) => p.communication?.rssi}
      />
    </div>
  )
}
