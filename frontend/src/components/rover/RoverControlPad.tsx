/**
 * RoverControlPad — D-pad + speed + mode + aux controls
 * Matches the reference image center panel
 */
import { useState, useCallback, useEffect } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, OctagonX, Gamepad2, Lightbulb, Camera, Volume2, Zap } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'
import { sendCommand } from '../../services/apiService'
import type { CommandType, RoverMode } from '../../types/telemetry'

function DPadButton({
  icon: Icon, command, label, className = '',
}: {
  icon: React.ElementType
  command: CommandType
  label: string
  className?: string
}) {
  const [active, setActive] = useState(false)

  const handlePress = useCallback(async () => {
    setActive(true)
    try {
      await sendCommand({ command, issued_by: 'OPERATOR' })
    } catch (e) { /* offline sim */ }
  }, [command])

  const handleRelease = useCallback(async () => {
    setActive(false)
    try {
      await sendCommand({ command: 'STOP', issued_by: 'OPERATOR' })
    } catch (e) { }
  }, [])

  return (
    <button
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      title={label}
      className={`flex items-center justify-center rounded transition-all duration-100 select-none ${className}`}
      style={{
        width: 52, height: 52,
        background: active ? 'rgba(29,140,248,0.25)' : 'rgba(14,22,32,0.9)',
        border: `1px solid ${active ? 'rgba(29,140,248,0.6)' : 'rgba(30,45,61,0.8)'}`,
        boxShadow: active ? '0 0 16px rgba(29,140,248,0.4)' : undefined,
        transform: active ? 'scale(0.95)' : undefined,
      }}
    >
      <Icon size={20} style={{ color: active ? '#1D8CF8' : '#8A9BB0' }} />
    </button>
  )
}

function AuxButton({ icon: Icon, label, command }: { icon: React.ElementType; label: string; command: CommandType }) {
  const [on, setOn] = useState(false)
  const toggle = async () => {
    const nextOn = !on
    setOn(nextOn)
    try {
      await sendCommand({ command: nextOn ? command : ('STOP' as CommandType) })
    } catch (e) { }
  }

  return (
    <button
      onClick={toggle}
      className="flex flex-col items-center gap-1"
      title={label}
    >
      <div
        className="flex items-center justify-center rounded"
        style={{
          width: 36, height: 36,
          background: on ? 'rgba(29,140,248,0.2)' : 'rgba(14,22,32,0.8)',
          border: `1px solid ${on ? 'rgba(29,140,248,0.5)' : 'rgba(30,45,61,0.6)'}`,
          transition: 'all 0.15s',
        }}
      >
        <Icon size={14} style={{ color: on ? '#1D8CF8' : '#6b7280' }} />
      </div>
      <span className="font-mono text-[9px] text-armor-text-dim tracking-wider">{label}</span>
    </button>
  )
}

export function RoverControlPad() {
  const latest = useARMORStore((s) => s.latest)
  const [speed, setSpeed] = useState(0.6)
  const [mode, setMode] = useState<RoverMode>('MANUAL')

  const currentMode = latest?.rover?.mode ?? mode
  const roverStatus = latest?.rover?.status ?? 'STOPPED'

  const handleEmergencyStop = async () => {
    try {
      await sendCommand({ command: 'EMERGENCY_STOP', issued_by: 'OPERATOR' })
    } catch (e) { }
  }

  const setDriveMode = async (m: RoverMode) => {
    setMode(m)
    // Update store state immediately
    const store = useARMORStore.getState()
    if (store.latest) {
      store.updateTelemetry({
        ...store.latest,
        rover: {
          ...store.latest.rover,
          mode: m,
        },
      })
    }
    try {
      await sendCommand({ command: 'SET_MODE', value: m === 'AUTONOMOUS' ? 1 : 0 })
    } catch (e) { }
  }


  return (
    <div className="armor-card h-full flex flex-col">
      <div className="armor-card-header">
        <Gamepad2 size={12} className="text-armor-primary" />
        <span className="armor-card-title">ROVER CONTROL</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: roverStatus === 'MOVING' ? '#22c55e' : roverStatus === 'STOPPED' ? '#f59e0b' : '#6b7280',
            }}
          />
          <span className="font-mono text-[10px] text-armor-text-dim">{roverStatus}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-3 px-2 gap-2">
        {/* D-Pad */}
        <div className="flex flex-col items-center gap-1">
          <DPadButton icon={ChevronUp} command="MOVE_FORWARD" label="Forward" />
          <div className="flex gap-1 items-center">
            <DPadButton icon={ChevronLeft} command="TURN_LEFT" label="Turn Left" />

            {/* STOP Center */}
            <button
              onClick={handleEmergencyStop}
              className="flex items-center justify-center rounded-full font-display font-bold tracking-widest transition-all duration-150 active:scale-95"
              style={{
                width: 64, height: 64,
                background: 'rgba(239,68,68,0.15)',
                border: '2px solid rgba(239,68,68,0.5)',
                color: '#ef4444',
                fontSize: 11,
                boxShadow: '0 0 20px rgba(239,68,68,0.2)',
              }}
            >
              <div className="flex flex-col items-center">
                <OctagonX size={16} />
                <span style={{ fontSize: 9, marginTop: 1 }}>STOP</span>
              </div>
            </button>

            <DPadButton icon={ChevronRight} command="TURN_RIGHT" label="Turn Right" />
          </div>
          <DPadButton icon={ChevronDown} command="MOVE_BACKWARD" label="Backward" />
        </div>

        {/* Speed Control */}
        <div className="w-full px-2">
          <div className="flex items-center justify-between mb-1">
            <span className="armor-card-title" style={{ fontSize: 9 }}>SPEED CONTROL</span>
            <span className="font-mono text-armor-primary text-[11px] font-semibold">{speed.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-armor-text-dim">0</span>
            <input
              type="range" min={0} max={2} step={0.1} value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 h-1.5 rounded appearance-none cursor-pointer"
              style={{ accentColor: '#1D8CF8' }}
            />
            <span className="font-mono text-[10px] text-armor-text-dim">2.0</span>
          </div>
        </div>

        {/* Drive Mode */}
        <div className="w-full px-2">
          <span className="armor-card-title block mb-1.5" style={{ fontSize: 9 }}>DRIVE MODE</span>
          <div className="flex gap-2">
            <button
              onClick={() => setDriveMode('MANUAL')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded font-display font-semibold text-xs tracking-wide transition-all duration-150"
              style={{
                background: currentMode === 'MANUAL' ? 'rgba(29,140,248,0.2)' : 'rgba(14,22,32,0.9)',
                border: `1px solid ${currentMode === 'MANUAL' ? 'rgba(29,140,248,0.5)' : 'rgba(30,45,61,0.6)'}`,
                color: currentMode === 'MANUAL' ? '#1D8CF8' : '#8A9BB0',
              }}
            >
              <Gamepad2 size={12} />
              MANUAL
            </button>
            <button
              onClick={() => setDriveMode('AUTONOMOUS')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded font-display font-semibold text-xs tracking-wide transition-all duration-150"
              style={{
                background: currentMode === 'AUTONOMOUS' ? 'rgba(167,139,250,0.2)' : 'rgba(14,22,32,0.9)',
                border: `1px solid ${currentMode === 'AUTONOMOUS' ? 'rgba(167,139,250,0.5)' : 'rgba(30,45,61,0.6)'}`,
                color: currentMode === 'AUTONOMOUS' ? '#a78bfa' : '#8A9BB0',
              }}
            >
              <Zap size={12} />
              AUTO
            </button>
          </div>
        </div>

        {/* Auxiliary Controls */}
        <div className="w-full px-2">
          <span className="armor-card-title block mb-2" style={{ fontSize: 9 }}>AUXILIARY CONTROLS</span>
          <div className="flex justify-around">
            <AuxButton icon={Lightbulb} label="LIGHTS" command="LIGHTS_ON" />
            <AuxButton icon={Camera} label="CAMERA" command="BUZZER_OFF" />
            <AuxButton icon={Volume2} label="HORN" command="BUZZER_ON" />
          </div>
        </div>
      </div>
    </div>
  )
}
