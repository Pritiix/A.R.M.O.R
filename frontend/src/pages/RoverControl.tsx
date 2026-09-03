import { useState, useEffect, useCallback } from 'react'
import { Gamepad2, OctagonX, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, Lightbulb, Volume2, ShieldAlert, Cpu } from 'lucide-react'
import { Card, Badge, Button, StatusIndicator } from '../components/ui'
import { sendCommand } from '../services/apiService'
import { useARMORStore } from '../store/armorStore'
import type { CommandType, RoverMode } from '../types/telemetry'

export function RoverControl() {
  const latest = useARMORStore((s) => s.latest)
  const [speed, setSpeed] = useState(0.6)
  const [lastCommand, setLastCommand] = useState<string>('NONE')
  const [commandLog, setCommandLog] = useState<{ time: string; cmd: string; sender: string }[]>([])

  const mode = latest?.rover?.mode ?? 'MANUAL'
  const status = latest?.rover?.status ?? 'STOPPED'

  const executeCommand = useCallback(async (cmd: CommandType, val?: number) => {
    setLastCommand(cmd)
    const timeStr = new Date().toLocaleTimeString()
    setCommandLog((prev) => [{ time: timeStr, cmd, sender: 'OPERATOR' }, ...prev].slice(0, 15))

    try {
      await sendCommand({ command: cmd, value: val, issued_by: 'OPERATOR' })
    } catch (e) {
      // Log offline fallback
    }
  }, [])

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          executeCommand('MOVE_FORWARD')
          break
        case 's':
        case 'arrowdown':
          executeCommand('MOVE_BACKWARD')
          break
        case 'a':
        case 'arrowleft':
          executeCommand('TURN_LEFT')
          break
        case 'd':
        case 'arrowright':
          executeCommand('TURN_RIGHT')
          break
        case ' ':
          executeCommand('EMERGENCY_STOP')
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        executeCommand('STOP')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [executeCommand])

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Rover Teleoperation & Motion Control
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            Dual L298N H-Bridge Motor Control • WASD / Arrow Key Binding Active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'MOVING' ? 'online' : 'info'}>
            {status}
          </Badge>
          <Badge variant={mode === 'AUTONOMOUS' ? 'primary' : 'warning'}>
            {mode} MODE
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main D-Pad Control Card */}
        <Card title="MANUAL JOYSTICK & DIRECTIONAL D-PAD" icon={Gamepad2} className="lg:col-span-2">
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            {/* D-Pad Layout */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="primary"
                size="lg"
                icon={ChevronUp}
                onMouseDown={() => executeCommand('MOVE_FORWARD')}
                onMouseUp={() => executeCommand('STOP')}
                className="w-20 h-14"
              >
                FORWARD
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ChevronLeft}
                  onMouseDown={() => executeCommand('TURN_LEFT')}
                  onMouseUp={() => executeCommand('STOP')}
                  className="w-20 h-14"
                >
                  LEFT
                </Button>

                {/* E-STOP Button */}
                <button
                  onClick={() => executeCommand('EMERGENCY_STOP')}
                  className="w-24 h-24 rounded-full flex flex-col items-center justify-center bg-red-600/20 border-2 border-red-500 text-red-500 font-display font-bold text-xs tracking-widest hover:bg-red-600/30 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  <OctagonX size={24} className="mb-1" />
                  E-STOP
                </button>

                <Button
                  variant="primary"
                  size="lg"
                  icon={ChevronRight}
                  onMouseDown={() => executeCommand('TURN_RIGHT')}
                  onMouseUp={() => executeCommand('STOP')}
                  className="w-20 h-14"
                >
                  RIGHT
                </Button>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={ChevronDown}
                onMouseDown={() => executeCommand('MOVE_BACKWARD')}
                onMouseUp={() => executeCommand('STOP')}
                className="w-20 h-14"
              >
                REVERSE
              </Button>
            </div>

            {/* Keyboard Guide */}
            <div className="flex items-center gap-4 text-armor-text-dim font-mono text-xs bg-armor-surface/60 px-4 py-2 rounded border border-armor-border">
              <span>WASD / Arrow Keys: Drive</span>
              <span>•</span>
              <span className="text-red-400 font-bold">Spacebar: Emergency Stop</span>
            </div>

            {/* Speed Control Slider */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-armor-text-dim">TARGET SPEED LIMIT:</span>
                <span className="text-armor-primary font-bold">{speed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 rounded bg-armor-surface appearance-none cursor-pointer accent-armor-primary"
              />
            </div>
          </div>
        </Card>

        {/* Right Panel: Modes & Motor Diagnostics */}
        <div className="space-y-4">
          {/* Mode Switcher */}
          <Card title="DRIVE MODE SELECTION">
            <div className="space-y-3 py-1">
              <Button
                variant={mode === 'MANUAL' ? 'primary' : 'secondary'}
                className="w-full justify-center py-2.5"
                onClick={() => executeCommand('SET_MODE', 0)}
              >
                MANUAL TELEOPERATION
              </Button>
              <Button
                variant={mode === 'AUTONOMOUS' ? 'primary' : 'secondary'}
                className="w-full justify-center py-2.5"
                onClick={() => executeCommand('SET_MODE', 1)}
              >
                AUTONOMOUS RECON
              </Button>
            </div>
          </Card>

          {/* Motor Driver Output Pins */}
          <Card title="L298N H-BRIDGE SIGNALS" icon={Cpu}>
            <div className="space-y-2 font-mono text-xs py-1">
              <div className="flex justify-between">
                <span className="text-armor-text-dim">IN1 / IN2 (Left Wheels):</span>
                <span className="text-emerald-400 font-bold">HIGH / LOW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-armor-text-dim">IN3 / IN4 (Right Wheels):</span>
                <span className="text-emerald-400 font-bold">HIGH / LOW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-armor-text-dim">PWM ENA / ENB:</span>
                <span className="text-armor-primary font-bold">{Math.round((speed / 2) * 255)} / 255</span>
              </div>
            </div>
          </Card>

          {/* Command Audit Log */}
          <Card title="COMMAND AUDIT TRAIL">
            <div className="h-40 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
              {commandLog.length === 0 ? (
                <div className="text-armor-text-dim text-center py-4">No commands issued yet.</div>
              ) : (
                commandLog.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-armor-border/30 pb-1">
                    <span className="text-armor-text-dim">{item.time}</span>
                    <span className="text-armor-primary font-bold">{item.cmd}</span>
                    <span className="text-armor-text-secondary">{item.sender}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
