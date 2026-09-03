import { useARMORStore } from '../store/armorStore'
import { Wind, Flame, AlertTriangle, ShieldCheck, Activity } from 'lucide-react'
import { Card, Badge, MetricDisplay, AlertBanner } from '../components/ui'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { THRESHOLDS } from '../config/constants'

export function GasMonitoring() {
  const latest = useARMORStore((s) => s.latest)
  const history = useARMORStore((s) => s.history)

  const s = latest?.sensors
  const smokeRaw = s?.smoke_raw ?? 0
  const smokePpm = s?.smoke_ppm ?? 0
  const smokeStatus = s?.smoke_status ?? 'NORMAL'

  const chartData = history.map((p, index) => ({
    time: p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : `#${index}`,
    raw: p.sensors?.smoke_raw ?? 0,
    ppm: p.sensors?.smoke_ppm ?? 0,
    warnLimit: THRESHOLDS.smoke.warning,
    critLimit: THRESHOLDS.smoke.critical,
  }))

  const isCritical = smokeStatus === 'CRITICAL'
  const isWarning = smokeStatus === 'WARNING'

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Gas & Hazard Monitoring System
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            MQ-2 Combustible Gas & Smoke Sensor Array (Analog ADC + Calibrated Est. PPM)
          </p>
        </div>
        <Badge variant={isCritical ? 'critical' : isWarning ? 'warning' : 'online'} pulse>
          {smokeStatus} HAZARD LEVEL
        </Badge>
      </div>

      {/* Alert Banner if elevated */}
      {isCritical && (
        <AlertBanner
          type="critical"
          message="CRITICAL HAZARD: Smoke/Combustible gas reading exceeded safety threshold (Raw ADC > 600)!"
        />
      )}
      {isWarning && (
        <AlertBanner
          type="warning"
          message="WARNING: Elevated gas levels detected in tunnel corridor (Raw ADC > 300)."
        />
      )}

      {/* Gas Sensor Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="RAW ADC VALUE" icon={Wind}>
          <MetricDisplay
            label="MQ-2 Sensor Output (0 - 4095)"
            value={smokeRaw}
            unit="ADC"
            color={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e'}
            status={smokeStatus}
          />
        </Card>
        <Card title="ESTIMATED CONCENTRATION" icon={Flame}>
          <MetricDisplay
            label="Calibrated PPM"
            value={smokePpm.toFixed(1)}
            unit="PPM"
            color={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e'}
          />
        </Card>
        <Card title="SAFETY THRESHOLD STATUS" icon={ShieldCheck}>
          <div className="space-y-2 py-1 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-armor-text-dim">Normal Level:</span>
              <span className="text-emerald-400 font-bold">&lt; 300 ADC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-armor-text-dim">Warning Threshold:</span>
              <span className="text-amber-400 font-bold">300 ADC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-armor-text-dim">Critical Threshold:</span>
              <span className="text-red-400 font-bold">600 ADC</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Gas Timeline Chart */}
      <Card title="REAL-TIME GAS CONCENTRATION TIMELINE (RAW ADC & THRESHOLDS)" icon={Activity}>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" />
              <XAxis dataKey="time" stroke="#8A9BB0" fontSize={10} />
              <YAxis stroke="#8A9BB0" fontSize={10} domain={[0, 1000]} />
              <Tooltip
                contentStyle={{ background: '#0D1620', borderColor: '#1E2D3D', color: '#E8EDF2', fontSize: 12 }}
              />
              <ReferenceLine y={THRESHOLDS.smoke.warning} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'WARNING (300)', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={THRESHOLDS.smoke.critical} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'CRITICAL (600)', fill: '#ef4444', fontSize: 10 }} />
              <Line type="monotone" dataKey="raw" stroke="#1D8CF8" strokeWidth={2} dot={false} name="MQ-2 Raw ADC" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Prototype Safety Notice */}
      <div className="p-3 rounded bg-armor-surface/40 border border-armor-border font-mono text-xs text-armor-text-dim">
        <p className="font-bold text-amber-400 mb-1">⚠ Prototype Sensor Disclaimer:</p>
        <p>
          The MQ-2 semiconductor sensor is utilized here for prototype demonstration purposes. Real-world underground coal/metal mine operations require ATEX / IECEx certified MSHA-approved sensors for methane ($CH_4$), carbon monoxide ($CO$), and oxygen ($O_2$) depletion monitoring.
        </p>
      </div>
    </div>
  )
}
