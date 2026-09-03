/**
 * MissionEventsPanel — scrollable mission event log with color-coded severity
 * Matches the "MISSION EVENTS" card in the reference image
 */
import { ScrollText, ChevronRight } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import type { MissionEvent } from '../../types/telemetry'

// Simulated event log for demo — will be replaced by real SQLite events in Phase 8
const DEMO_EVENTS: MissionEvent[] = [
  { id: 1, mission_id: 'MISSION-001', rover_id: 'ARMOR-01', timestamp: new Date(Date.now() - 60000).toISOString(), event_type: 'SMOKE_CRITICAL', description: 'Rockfall Impact Detected', severity: 'CRITICAL', zone: 'Corridor B' },
  { id: 2, mission_id: 'MISSION-001', rover_id: 'ARMOR-01', timestamp: new Date(Date.now() - 120000).toISOString(), event_type: 'SMOKE_WARNING', description: 'Elevated Gas Detected', severity: 'WARNING', zone: 'Corridor A' },
  { id: 3, mission_id: 'MISSION-001', rover_id: 'ARMOR-01', timestamp: new Date(Date.now() - 240000).toISOString(), event_type: 'SYSTEM', description: 'Node 03 Deployed', severity: 'NORMAL', zone: 'Junction 1' },
  { id: 4, mission_id: 'MISSION-001', rover_id: 'ARMOR-01', timestamp: new Date(Date.now() - 360000).toISOString(), event_type: 'ROVER_COMMAND', description: 'Rover Entered Corridor B', severity: 'NORMAL', zone: 'Corridor B' },
  { id: 5, mission_id: 'MISSION-001', rover_id: 'ARMOR-01', timestamp: new Date(Date.now() - 480000).toISOString(), event_type: 'MISSION_STARTED', description: 'Mission Started', severity: 'NORMAL', zone: undefined },
]

function formatTime(ts: string): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function EventBadge({ severity, type }: { severity: string; type: string }) {
  const isAlert = severity === 'CRITICAL'
  const isHazard = severity === 'WARNING'
  const isNav = type === 'ROVER_COMMAND'
  const isDeploy = type === 'SYSTEM' && !isAlert && !isHazard
  const isSystem = type === 'MISSION_STARTED'

  const [color, label] =
    isAlert ? ['#ef4444', 'ALERT']
    : isHazard ? ['#f59e0b', 'HAZARD']
    : isNav ? ['#60a5fa', 'NAVIGATION']
    : isDeploy ? ['#a78bfa', 'DEPLOYMENT']
    : ['#6b7280', 'SYSTEM']

  return (
    <span
      className="font-mono font-bold tracking-wider"
      style={{
        fontSize: 9,
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        padding: '1px 5px',
        borderRadius: 2,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  )
}

function EventRow({ event }: { event: MissionEvent }) {
  const dotColor =
    event.severity === 'CRITICAL' ? '#ef4444'
    : event.severity === 'WARNING' ? '#f59e0b'
    : event.event_type === 'ROVER_COMMAND' ? '#60a5fa'
    : event.event_type === 'SYSTEM' ? '#a78bfa'
    : '#22c55e'

  return (
    <div
      className="flex items-start gap-2 py-2 animate-fade-in"
      style={{ borderBottom: '1px solid rgba(30,45,61,0.4)' }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
        style={{
          background: dotColor,
          boxShadow: event.severity !== 'NORMAL' ? `0 0 4px ${dotColor}` : undefined,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-mono text-[10px] text-armor-text-dim flex-shrink-0">{formatTime(event.timestamp)}</span>
          <span className="font-mono text-[11px] text-armor-text-primary truncate flex-1">{event.description}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {event.zone && (
            <span className="font-mono text-[10px] text-armor-text-dim truncate">{event.zone}</span>
          )}
          <EventBadge severity={event.severity} type={event.event_type} />
        </div>
      </div>
    </div>
  )
}

export function MissionEventsPanel() {
  const navigate = useNavigate()
  const storeEvents = useARMORStore((s) => s.missionEvents)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Merge store events (real) with demo events
  const allEvents = [...storeEvents, ...DEMO_EVENTS].slice(0, 20)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [storeEvents.length])

  return (
    <div className="armor-card h-full flex flex-col">
      <div className="armor-card-header">
        <ScrollText size={12} className="text-armor-primary" />
        <span className="armor-card-title">MISSION EVENTS</span>
        <button
          onClick={() => navigate('/mission-logs')}
          className="ml-auto font-mono text-[10px] text-armor-primary hover:text-armor-accent transition-colors tracking-wider uppercase"
        >
          VIEW ALL
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3"
        style={{ minHeight: 0 }}
      >
        {allEvents.map((e, i) => (
          <EventRow key={e.id ?? i} event={e} />
        ))}
      </div>
    </div>
  )
}
