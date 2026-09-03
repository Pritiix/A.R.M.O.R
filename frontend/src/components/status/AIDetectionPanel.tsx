/**
 * AIDetectionPanel — matches the "AI DETECTION" card in the reference image
 */
import { Brain, ChevronRight, MapPin, User, Flame, Mountain } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useARMORStore } from '../../store/armorStore'

interface DetectionItemProps {
  icon: React.ElementType
  label: string
  confidence: number
  color?: string
}

function DetectionItem({ icon: Icon, label, confidence, color = '#f59e0b' }: DetectionItemProps) {
  return (
    <div
      className="flex items-center gap-2 py-2"
      style={{ borderBottom: '1px solid rgba(30,45,61,0.4)' }}
    >
      <div
        className="flex items-center justify-center rounded flex-shrink-0"
        style={{ width: 24, height: 24, background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Icon size={12} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[11px] text-armor-text-primary truncate">{label}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 2, background: 'rgba(30,45,61,0.8)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${confidence}%`, background: color, transition: 'width 0.5s ease' }}
            />
          </div>
          <span className="font-mono text-[10px] flex-shrink-0" style={{ color }}>{confidence}%</span>
        </div>
      </div>
    </div>
  )
}

export function AIDetectionPanel() {
  const latest = useARMORStore((s) => s.latest)
  const navigate = useNavigate()
  const currentScenario = useARMORStore((s) => s.currentScenario)

  // Derive AI detections from current scenario
  const isPersonDetected = currentScenario === 'PERSON_DETECTED'
  const isSmokeWarning = currentScenario === 'SMOKE_WARNING' || currentScenario === 'SMOKE_CRITICAL'

  const detections = [
    { icon: Mountain, label: 'Rockfall', confidence: 94, color: '#ef4444', show: true },
    { icon: Flame, label: isSmokeWarning ? 'Elevated Gas Detected' : 'Smoke/Gas', confidence: isSmokeWarning ? 91 : 12, color: isSmokeWarning ? '#f59e0b' : '#6b7280', show: true },
    { icon: User, label: 'Person Detected', confidence: isPersonDetected ? 87 : 8, color: isPersonDetected ? '#ef4444' : '#6b7280', show: isPersonDetected || false },
  ].filter((d) => d.confidence > 20 || d.show)

  const activeCount = detections.filter((d) => d.confidence > 50).length

  return (
    <div className="armor-card h-full flex flex-col">
      <div className="armor-card-header">
        <Brain size={12} className="text-armor-primary" />
        <span className="armor-card-title">AI DETECTION</span>
        <div className="ml-auto">
          <span
            className="font-mono text-[10px] font-semibold"
            style={{ color: activeCount > 0 ? '#f59e0b' : '#22c55e' }}
          >
            {activeCount > 0 ? `${activeCount} ACTIVE` : 'CLEAR'}
          </span>
        </div>
      </div>

      <div className="flex-1 px-3 overflow-hidden">
        {detections.map((d) => (
          <DetectionItem key={d.label} icon={d.icon} label={d.label} confidence={d.confidence} color={d.color} />
        ))}

        {/* Inference status */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
          <span className="font-mono text-[10px] text-armor-text-dim">Inference running @ 12fps</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/telemetry')}
        className="flex items-center justify-between px-3 py-2 border-t border-armor-border hover:bg-armor-surface transition-colors"
        style={{ fontSize: 10 }}
      >
        <span className="font-mono text-armor-primary tracking-wider uppercase">View All Detections</span>
        <ChevronRight size={11} className="text-armor-primary" />
      </button>
    </div>
  )
}
