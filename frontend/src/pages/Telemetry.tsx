import { useARMORStore } from '../store/armorStore'
import { Activity, Thermometer, Droplets, Wind, Battery, Wifi, RefreshCw } from 'lucide-react'
import { Card, Badge, MetricDisplay } from '../components/ui'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export function Telemetry() {
  const latest = useARMORStore((s) => s.latest)
  const history = useARMORStore((s) => s.history)

  const s = latest?.sensors
  const r = latest?.rover
  const c = latest?.communication

  // Format telemetry history for Recharts
  const chartData = history.map((p, index) => {
    const timeStr = p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : `#${index}`
    return {
      time: timeStr,
      temp: p.sensors?.temperature ?? 0,
      humidity: p.sensors?.humidity ?? 0,
      speed: p.rover?.speed ?? 0,
      battery: p.rover?.battery ?? 0,
      smokeRaw: p.sensors?.smoke_raw ?? 0,
      rssi: p.communication?.rssi ?? -100,
    }
  })

  return (
    <div className="page-container space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Telemetry Analysis & Sensor Metrics
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            Real-time streaming telemetry data buffer ({history.length} packets cached)
          </p>
        </div>
        <Badge variant="primary" pulse>
          LIVE STREAM
        </Badge>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card title="BATTERY LEVEL" icon={Battery}>
          <MetricDisplay
            label="Remaining Capacity"
            value={r?.battery?.toFixed(1) ?? null}
            unit="%"
            color={r?.battery && r.battery < 25 ? '#ef4444' : '#22c55e'}
          />
        </Card>
        <Card title="TEMPERATURE" icon={Thermometer}>
          <MetricDisplay
            label="Ambient Temp"
            value={s?.temperature?.toFixed(1) ?? null}
            unit="°C"
            color={s?.temperature && s.temperature > 35 ? '#f59e0b' : '#1D8CF8'}
          />
        </Card>
        <Card title="HUMIDITY" icon={Droplets}>
          <MetricDisplay
            label="Relative Humidity"
            value={s?.humidity?.toFixed(1) ?? null}
            unit="%"
            color="#00B4D8"
          />
        </Card>
        <Card title="ROVER SPEED" icon={Activity}>
          <MetricDisplay
            label="Linear Speed"
            value={r?.speed?.toFixed(2) ?? null}
            unit="m/s"
            color="#a78bfa"
          />
        </Card>
      </div>

      {/* Main Multi-Metric Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature & Humidity Chart */}
        <Card title="TEMPERATURE & HUMIDITY HISTORY" icon={Thermometer}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D8CF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1D8CF8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" />
                <XAxis dataKey="time" stroke="#8A9BB0" fontSize={10} />
                <YAxis stroke="#8A9BB0" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: '#0D1620', borderColor: '#1E2D3D', color: '#E8EDF2', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="temp" stroke="#1D8CF8" fillOpacity={1} fill="url(#tempGrad)" name="Temp (°C)" />
                <Area type="monotone" dataKey="humidity" stroke="#00B4D8" fillOpacity={1} fill="url(#humGrad)" name="Humidity (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Speed & Signal Strength Chart */}
        <Card title="SPEED & SIGNAL STRENGTH" icon={Wifi}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" />
                <XAxis dataKey="time" stroke="#8A9BB0" fontSize={10} />
                <YAxis stroke="#8A9BB0" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: '#0D1620', borderColor: '#1E2D3D', color: '#E8EDF2', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="speed" stroke="#a78bfa" fillOpacity={1} fill="url(#speedGrad)" name="Speed (m/s)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Raw Data Stream Table */}
      <Card title="RECENT PACKET STREAM (LAST 10)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-armor-border text-[10px] font-mono text-armor-text-dim uppercase">
                <th className="py-2 px-3">SEQ</th>
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">BATTERY</th>
                <th className="py-2 px-3">TEMP</th>
                <th className="py-2 px-3">HUMIDITY</th>
                <th className="py-2 px-3">GAS (RAW)</th>
                <th className="py-2 px-3">SIGNAL</th>
                <th className="py-2 px-3">MODE</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-armor-text-secondary divide-y divide-armor-border/40">
              {history.slice(-10).reverse().map((packet, i) => (
                <tr key={packet.sequence ?? i} className="hover:bg-armor-surface/50 transition-colors">
                  <td className="py-2 px-3 text-armor-primary font-bold">#{packet.sequence}</td>
                  <td className="py-2 px-3 text-armor-text-dim">{new Date(packet.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2 px-3">{packet.rover?.battery?.toFixed(0)}%</td>
                  <td className="py-2 px-3">{packet.sensors?.temperature?.toFixed(1)}°C</td>
                  <td className="py-2 px-3">{packet.sensors?.humidity?.toFixed(1)}%</td>
                  <td className="py-2 px-3">{packet.sensors?.smoke_raw} ADC</td>
                  <td className="py-2 px-3">{packet.communication?.rssi?.toFixed(0)} dBm</td>
                  <td className="py-2 px-3">{packet.rover?.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
