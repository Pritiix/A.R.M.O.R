import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Eye, Map, Activity, Wind, Radio,
  Gamepad2, ScrollText, FileBarChart, Box,
  ChevronLeft, ChevronRight, Shield
} from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'
import type { WSStatus } from '../../store/armorStore'

const NAV_ITEMS = [
  { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/live-vision',    icon: Eye,             label: 'Live Vision' },
  { path: '/mine-map',       icon: Map,             label: 'Mine Map' },
  { path: '/telemetry',      icon: Activity,        label: 'Telemetry' },
  { path: '/gas-monitoring', icon: Wind,            label: 'Gas Monitoring' },
  { path: '/communication',  icon: Radio,           label: 'Communication' },
  { path: '/rover-control',  icon: Gamepad2,        label: 'Rover Control' },
  { path: '/mission-logs',   icon: ScrollText,      label: 'Mission Logs' },
  { path: '/reports',        icon: FileBarChart,    label: 'Reports' },
  { path: '/rover-3d',       icon: Box,             label: '3D Viewer' },
] as const

function wsStatusLabel(status: WSStatus): string {
  switch (status) {
    case 'connected':    return 'ONLINE'
    case 'connecting':   return 'CONN...'
    case 'disconnected': return 'OFFLINE'
    case 'error':        return 'ERROR'
  }
}

function StatusRow({ label, status, online, color }: { label: string; status: string; online: boolean; color?: string }) {
  const dotColor = color ?? (online ? '#22c55e' : '#6b7280')
  const textColor = color ?? (online ? '#22c55e' : '#6b7280')
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-armor-text-dim font-mono tracking-wider" style={{ fontSize: 9 }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor, boxShadow: online ? `0 0 4px ${dotColor}` : undefined }} />
        <span className="font-mono font-medium" style={{ color: textColor, fontSize: 9 }}>{status}</span>
      </div>
    </div>
  )
}

export function Sidebar() {
  const collapsed = useARMORStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useARMORStore((s) => s.toggleSidebar)
  const wsStatus = useARMORStore((s) => s.wsStatus)
  const roverConnected = useARMORStore((s) => s.roverConnected)
  const telemetryMode = useARMORStore((s) => s.telemetryMode)
  const latest = useARMORStore((s) => s.latest)

  const sidebarWidth = collapsed ? 52 : 196

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-200"
      style={{ width: sidebarWidth, background: '#0D1620', borderRight: '1px solid #1E2D3D' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-armor-border" style={{ minHeight: 56 }}>
        <div
          className="flex-shrink-0 flex items-center justify-center rounded"
          style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #1D8CF8, #0066cc)', color: '#fff' }}
        >
          <Shield size={16} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display font-bold text-armor-text-primary leading-tight tracking-widest" style={{ fontSize: 13 }}>A.R.M.O.R.</div>
            <div className="text-armor-text-dim tracking-widest uppercase leading-tight" style={{ fontSize: 8 }}>Autonomous Rover</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1.5">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 mx-1.5 my-0.5 rounded transition-all duration-150
              ${isActive
                ? 'bg-armor-primary/15 text-armor-primary border border-armor-primary/30'
                : 'text-armor-text-secondary hover:text-armor-text-primary hover:bg-armor-surface border border-transparent'
              }`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={14} className="flex-shrink-0" style={{ color: isActive ? '#1D8CF8' : undefined }} />
                {!collapsed && <span className="text-xs font-medium truncate">{label}</span>}
                {!collapsed && isActive && <div className="ml-auto w-1 h-1 rounded-full flex-shrink-0 bg-armor-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Rover Info — shown when not collapsed */}
      {!collapsed && (
        <div className="border-t border-armor-border px-3 py-2.5">
          <div className="text-armor-text-dim font-mono mb-2" style={{ fontSize: 9, letterSpacing: '0.12em' }}>ROVER INFO</div>

          {/* Mini rover SVG */}
          <div className="mb-2 flex justify-center">
            <svg viewBox="0 0 100 55" width={100} height={55}>
              {/* Tracks */}
              <rect x={2} y={20} width={96} height={18} rx={4} fill="#1a2535" stroke="#2a3d52" strokeWidth={1} />
              {/* Body */}
              <rect x={12} y={10} width={76} height={28} rx={3} fill="#162030" stroke="#1E2D3D" strokeWidth={1} />
              {/* Camera */}
              <rect x={42} y={3} width={16} height={10} rx={2} fill="#0D1620" stroke="#1D8CF8" strokeWidth={0.8} />
              <circle cx={50} cy={8} r={3} fill="#1D8CF8" opacity={0.7} />
              {/* Sensors */}
              <circle cx={25} cy={18} r={3} fill="#f59e0b" opacity={0.8} />
              <rect x={70} y={13} width={8} height={10} rx={1} fill="#22c55e" opacity={0.7} />
              {/* LEDs */}
              <circle cx={15} cy={42} r={2.5} fill="rgba(200,220,255,0.9)" />
              <circle cx={85} cy={42} r={2.5} fill="rgba(200,220,255,0.9)" />
              {/* Wheel indicators */}
              {[10, 35, 60, 85].map((x) => (
                <circle key={x} cx={x + 2} cy={32} r={6} fill="none" stroke="#2a3d52" strokeWidth={2} />
              ))}
            </svg>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-armor-text-dim font-mono" style={{ fontSize: 9 }}>ROVER ID</span>
              <span className="text-armor-text-primary font-mono font-semibold" style={{ fontSize: 9 }}>ARMOR-01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-armor-text-dim font-mono" style={{ fontSize: 9 }}>STATUS</span>
              <span
                className="font-mono font-semibold"
                style={{
                  fontSize: 9,
                  color: roverConnected ? '#22c55e' : '#6b7280',
                }}
              >
                {roverConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status Footer */}
      {!collapsed && (
        <div className="border-t border-armor-border px-3 py-2 space-y-0.5">
          <StatusRow label="ESP32" status={roverConnected ? 'ONLINE' : 'OFFLINE'} online={roverConnected} />
          <StatusRow label="BACKEND" status={wsStatusLabel(wsStatus)} online={wsStatus === 'connected'} />
          <StatusRow label="CAMERA" status="OFFLINE" online={false} />
          <StatusRow label="MODE" status={telemetryMode === 'simulation' ? 'SIM' : 'LIVE'} online={true} color="#f59e0b" />
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-8 border-t border-armor-border w-full text-armor-text-dim hover:text-armor-text-primary hover:bg-armor-surface transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
