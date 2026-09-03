/**
 * MineMapSVG — offline SVG mine map with rover position, tunnel paths,
 * hazard zones, and communication nodes.
 * Works 100% offline. No Google Maps or map tiles.
 */
import { Map, Maximize2, Plus, Minus } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'
import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'

interface Props {
  onExpand?: () => void
}

// Mine layout — static tunnel definition
const TUNNELS = [
  // Main horizontal corridor A
  { x1: 30, y1: 120, x2: 180, y2: 120, label: 'Corridor A', width: 10 },
  // Junction
  { x1: 180, y1: 120, x2: 180, y2: 60, label: 'Shaft 1', width: 8 },
  // Corridor B — branching right
  { x1: 180, y1: 120, x2: 320, y2: 100, label: 'Corridor B', width: 10 },
  // Side tunnel
  { x1: 180, y1: 60, x2: 260, y2: 40, label: 'Corridor C', width: 7 },
  // Dead end
  { x1: 320, y1: 100, x2: 350, y2: 140, label: 'Dead End', width: 6 },
]

const EXPLORED_PATHS = [
  { x1: 30, y1: 120, x2: 180, y2: 120 },
  { x1: 180, y1: 120, x2: 240, y2: 112 },
]

const HAZARD_ZONES = [
  { cx: 240, cy: 112, r: 18, type: 'smoke', label: 'Gas Detected' },
]

const COMM_NODES = [
  { x: 80, y: 120, label: 'Node 01', signal: 'strong' },
  { x: 180, y: 120, label: 'Node 02', signal: 'strong' },
  { x: 240, y: 112, label: 'Node 03', signal: 'weak' },
]

export function MineMapSVG({ onExpand }: Props) {
  const latest = useARMORStore((s) => s.latest)
  const navigate = useNavigate()
  const [scale, setScale] = useState(1)

  const roverX = latest ? Math.max(30, Math.min(350, 30 + latest.position.x * 15)) : 240
  const roverY = latest ? Math.max(20, Math.min(160, 120 + latest.position.y * 5)) : 112
  const heading = latest?.rover?.heading ?? 0

  return (
    <div className="armor-card h-full flex flex-col">
      <div className="armor-card-header">
        <Map size={12} className="text-armor-primary" />
        <span className="armor-card-title">MINE MAP</span>
        <div className="ml-auto flex items-center gap-2">
          {/* Zoom */}
          <button onClick={() => setScale((s) => Math.min(2, s + 0.2))} className="text-armor-text-dim hover:text-armor-text-primary p-0.5"><Plus size={11} /></button>
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} className="text-armor-text-dim hover:text-armor-text-primary p-0.5"><Minus size={11} /></button>
          <button onClick={onExpand} className="text-armor-text-dim hover:text-armor-text-primary p-0.5"><Maximize2 size={11} /></button>
        </div>
      </div>

      {/* Map SVG */}
      <div className="flex-1 overflow-hidden relative" style={{ background: '#080E15' }}>
        <svg
          viewBox="0 0 390 190"
          className="w-full h-full"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(29,140,248,0.04)" strokeWidth="0.5" />
            </pattern>
            {/* Rover body */}
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#1D8CF8" />
            </marker>
          </defs>
          <rect width="390" height="190" fill="url(#grid)" />

          {/* Unexplored tunnels */}
          {TUNNELS.map((t, i) => (
            <line
              key={`tunnel-${i}`}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="rgba(30,45,61,0.9)"
              strokeWidth={t.width}
              strokeLinecap="round"
            />
          ))}

          {/* Explored path overlay */}
          {EXPLORED_PATHS.map((p, i) => (
            <line
              key={`explored-${i}`}
              x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}
              stroke="rgba(29,140,248,0.25)"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray="4,2"
            />
          ))}

          {/* Rover trail dots */}
          {[[180, 120], [200, 118], [220, 115], [240, 112]].map(([x, y], i) => (
            <circle key={`trail-${i}`} cx={x} cy={y} r={1.5} fill="rgba(29,140,248,0.5)" />
          ))}

          {/* Hazard zones */}
          {HAZARD_ZONES.map((h, i) => (
            <g key={`hazard-${i}`}>
              <circle cx={h.cx} cy={h.cy} r={h.r} fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.4)" strokeWidth={1} strokeDasharray="3,2">
                <animate attributeName="r" values={`${h.r};${h.r + 4};${h.r}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
              </circle>
              <text x={h.cx} y={h.cy - h.r - 4} fontSize="6" fill="#f59e0b" textAnchor="middle" fontFamily="monospace">⚠</text>
            </g>
          ))}

          {/* Comm nodes */}
          {COMM_NODES.map((n, i) => (
            <g key={`node-${i}`}>
              <circle cx={n.x} cy={n.y} r={5} fill="rgba(29,140,248,0.15)" stroke={n.signal === 'weak' ? 'rgba(245,158,11,0.6)' : 'rgba(29,140,248,0.6)'} strokeWidth={1} />
              <circle cx={n.x} cy={n.y} r={2} fill={n.signal === 'weak' ? '#f59e0b' : '#1D8CF8'} />
              <text x={n.x} y={n.y - 8} fontSize="5.5" fill="#8A9BB0" textAnchor="middle" fontFamily="monospace">{n.label}</text>
            </g>
          ))}

          {/* Comm links */}
          {COMM_NODES.slice(0, -1).map((n, i) => (
            <line
              key={`link-${i}`}
              x1={n.x} y1={n.y}
              x2={COMM_NODES[i + 1].x} y2={COMM_NODES[i + 1].y}
              stroke="rgba(29,140,248,0.2)"
              strokeWidth={0.8}
              strokeDasharray="4,3"
            />
          ))}

          {/* Rover */}
          <g transform={`translate(${roverX}, ${roverY}) rotate(${heading})`}>
            {/* Body */}
            <rect x={-8} y={-5} width={16} height={10} rx={2} fill="#1D8CF8" opacity={0.9} />
            {/* Direction arrow */}
            <polygon points="8,0 4,-3 4,3" fill="#E8EDF2" />
            {/* Pulsing ring */}
            <circle cx={0} cy={0} r={12} fill="none" stroke="rgba(29,140,248,0.4)" strokeWidth={1}>
              <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Legend */}
          <g transform="translate(10, 165)">
            <circle cx={5} cy={5} r={3} fill="#1D8CF8" />
            <text x={12} y={8} fontSize="5.5" fill="#8A9BB0" fontFamily="monospace">ROVER</text>
            <circle cx={55} cy={5} r={4} fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth={0.8} />
            <text x={63} y={8} fontSize="5.5" fill="#8A9BB0" fontFamily="monospace">HAZARD</text>
            <line x1={100} y1={5} x2={116} y2={5} stroke="rgba(29,140,248,0.5)" strokeWidth={2} strokeDasharray="3,2" />
            <text x={120} y={8} fontSize="5.5" fill="#8A9BB0" fontFamily="monospace">EXPLORED</text>
          </g>
        </svg>

        {/* Zone indicator */}
        <div
          className="absolute bottom-2 right-2 font-mono text-[9px] px-2 py-1 rounded"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#8A9BB0', border: '1px solid rgba(30,45,61,0.6)' }}
        >
          {latest?.position?.zone ?? 'UNKNOWN'}
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={() => navigate('/mine-map')}
        className="flex items-center justify-between px-3 py-2 border-t border-armor-border hover:bg-armor-surface transition-colors"
        style={{ fontSize: 10 }}
      >
        <span className="font-mono text-armor-primary tracking-wider uppercase">Open Full Map</span>
        <Maximize2 size={11} className="text-armor-primary" />
      </button>
    </div>
  )
}
