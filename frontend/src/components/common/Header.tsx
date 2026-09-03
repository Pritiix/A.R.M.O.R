import { Battery, Wifi, WifiOff, Clock, AlertTriangle, Zap, Box, MapPin } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSimulationScenario } from '../../services/apiService'
import { SIMULATION_SCENARIOS } from '../../config/constants'
import type { SimulationScenario } from '../../types/telemetry'

function useMissionTimer(startTime: string | null): string {
  const [elapsed, setElapsed] = useState('00:00:00')
  useEffect(() => {
    if (!startTime) return
    const update = () => {
      const diff = Date.now() - new Date(startTime).getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setElapsed(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startTime])
  return elapsed
}

function HeaderStat({ label, value, color, children }: { label: string; value?: string; color?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-armor-text-dim font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em' }}>{label}</span>
      {children ?? <span className="font-mono font-semibold" style={{ fontSize: 11, color: color ?? '#E8EDF2' }}>{value}</span>}
    </div>
  )
}

export function Header() {
  const latest = useARMORStore((s) => s.latest)
  const isStale = useARMORStore((s) => s.isStale)
  const wsStatus = useARMORStore((s) => s.wsStatus)
  const missionStartTime = useARMORStore((s) => s.missionStartTime)
  const telemetryMode = useARMORStore((s) => s.telemetryMode)
  const currentScenario = useARMORStore((s) => s.currentScenario)
  const setScenario = useARMORStore((s) => s.setScenario)
  const missionId = useARMORStore((s) => s.missionId)
  const navigate = useNavigate()
  const missionTimer = useMissionTimer(missionStartTime)

  const battery = latest?.rover?.battery ?? null
  const mode = latest?.rover?.mode ?? 'MANUAL'
  const roverStatus = latest?.rover?.status ?? 'OFFLINE'
  const rssi = latest?.communication?.rssi ?? null
  const wsConnected = wsStatus === 'connected'
  const speed = latest?.rover?.speed ?? null
  const zone = latest?.position?.zone ?? 'UNKNOWN'

  const batteryColor = battery === null ? '#6b7280' : battery < 10 ? '#ef4444' : battery < 25 ? '#f59e0b' : '#22c55e'

  const handleScenarioChange = useCallback(async (scenario: SimulationScenario) => {
    setScenario(scenario)
    try { await setSimulationScenario(scenario) } catch (e) { }
  }, [setScenario])

  return (
    <header
      className="flex items-center h-14 px-3 gap-4 flex-shrink-0"
      style={{ background: '#0D1620', borderBottom: '1px solid #1E2D3D' }}
    >
      {/* Branding */}
      <div className="flex flex-col flex-shrink-0">
        <span className="font-display font-bold text-armor-text-primary tracking-widest uppercase leading-none" style={{ fontSize: 13 }}>
          A.R.M.O.R.
        </span>
        <span className="text-armor-text-dim font-mono tracking-widest uppercase" style={{ fontSize: 7 }}>
          Mission Control
        </span>
      </div>

      <div className="h-7 w-px bg-armor-border flex-shrink-0" />

      {/* Mission / Location */}
      <HeaderStat label="MISSION" value={missionId} />
      <HeaderStat label="LOCATION">
        <div className="flex items-center gap-1">
          <MapPin size={10} style={{ color: '#1D8CF8' }} />
          <span className="font-mono font-semibold" style={{ fontSize: 11, color: '#E8EDF2' }}>{zone}</span>
        </div>
      </HeaderStat>

      <div className="h-7 w-px bg-armor-border flex-shrink-0" />

      {/* Battery */}
      <HeaderStat label="BATTERY">
        <div className="flex items-center gap-1">
          <Battery size={11} style={{ color: batteryColor }} />
          <span className="font-mono font-semibold" style={{ fontSize: 11, color: batteryColor }}>
            {battery !== null ? `${battery.toFixed(0)} %` : '--'}
          </span>
        </div>
      </HeaderStat>

      {/* Speed */}
      <HeaderStat label="SPEED" value={speed !== null ? `${speed.toFixed(1)} m/s` : '--'} />

      {/* Signal */}
      <HeaderStat label="SIGNAL">
        <div className="flex items-center gap-1">
          {wsConnected ? <Wifi size={10} style={{ color: rssi && rssi > -75 ? '#22c55e' : '#f59e0b' }} /> : <WifiOff size={10} style={{ color: '#6b7280' }} />}
          <span className="font-mono font-semibold" style={{ fontSize: 11 }}>{rssi !== null ? `${rssi.toFixed(0)} dBm` : '--'}</span>
        </div>
      </HeaderStat>

      {/* Timer */}
      <HeaderStat label="MISSION TIME">
        <div className="flex items-center gap-1">
          <Clock size={10} className="text-armor-primary" />
          <span className="font-mono font-semibold" style={{ fontSize: 11 }}>{missionTimer}</span>
        </div>
      </HeaderStat>

      <div className="flex-1" />

      {/* Stale indicator */}
      {isStale && (
        <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 9 }}>
          <AlertTriangle size={10} />
          <span className="font-mono font-bold tracking-widest">STALE</span>
        </div>
      )}

      {/* Scenario Selector — only in simulation */}
      {telemetryMode === 'simulation' && (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-armor-text-dim" style={{ fontSize: 9 }}>SCENARIO:</span>
          <select
            value={currentScenario}
            onChange={(e) => handleScenarioChange(e.target.value as SimulationScenario)}
            className="font-mono font-semibold rounded px-2 py-1 text-amber-400 cursor-pointer"
            style={{
              fontSize: 9,
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              outline: 'none',
              letterSpacing: '0.08em',
            }}
          >
            {SIMULATION_SCENARIOS.map((s) => (
              <option key={s.value} value={s.value} style={{ background: '#111A23' }}>{s.value.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      )}

      {/* Mode badge / toggle button */}
      <button
        onClick={() => {
          const nextMode = telemetryMode === 'simulation' ? 'live' : 'simulation'
          useARMORStore.getState().setTelemetryMode(nextMode)
        }}
        title="Click to toggle Telemetry Mode (SIMULATION / LIVE)"
        className="flex items-center gap-1 px-2 py-1 rounded flex-shrink-0 cursor-pointer hover:brightness-125 transition-all active:scale-95"
        style={{
          background: telemetryMode === 'simulation' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
          border: `1px solid ${telemetryMode === 'simulation' ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)'}`,
          color: telemetryMode === 'simulation' ? '#f59e0b' : '#22c55e',
          fontSize: 9,
        }}
      >
        <Zap size={10} />
        <span className="font-mono font-bold tracking-widest">{telemetryMode === 'simulation' ? '⚡ SIMULATION' : '● LIVE HARDWARE'}</span>
      </button>


      {/* Connection badge */}
      <div className="flex items-center gap-1 px-2 py-1 rounded flex-shrink-0" style={{ background: wsConnected ? 'rgba(34,197,94,0.08)' : 'rgba(107,114,128,0.1)', border: `1px solid ${wsConnected ? 'rgba(34,197,94,0.25)' : 'rgba(107,114,128,0.2)'}`, color: wsConnected ? '#22c55e' : '#6b7280', fontSize: 9 }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: wsConnected ? '#22c55e' : '#6b7280', boxShadow: wsConnected ? '0 0 4px #22c55e' : undefined }} />
        <span className="font-mono font-bold tracking-widest">{wsConnected ? 'BACKEND ONLINE' : 'OFFLINE'}</span>
      </div>

      {/* View Rover 3D Model */}
      <button
        onClick={() => navigate('/rover-3d')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-semibold tracking-wider transition-all duration-150 flex-shrink-0"
        style={{
          fontSize: 9,
          background: 'rgba(29,140,248,0.1)',
          border: '1px solid rgba(29,140,248,0.35)',
          color: '#1D8CF8',
        }}
      >
        <Box size={11} />
        VIEW ROVER 3D MODEL
      </button>
    </header>
  )
}
