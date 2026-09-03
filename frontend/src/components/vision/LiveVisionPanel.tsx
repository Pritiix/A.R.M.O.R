/**
 * LiveVisionPanel — camera feed card for the dashboard
 * Phase 1: shows a realistic mine tunnel placeholder
 * Phase 7: will hook into ESP32-CAM MJPEG stream
 */
import { useState } from 'react'
import { Camera, Maximize2, Wifi, WifiOff, Cpu } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'

interface Props {
  onExpand?: () => void
}

export function LiveVisionPanel({ onExpand }: Props) {
  const latest = useARMORStore((s) => s.latest)
  const [aiOverlay] = useState(true)
  const cameraHealth = latest?.sensor_health?.camera ?? 'OFFLINE'
  const zone = latest?.position?.zone ?? 'UNKNOWN'

  return (
    <div className="armor-card h-full flex flex-col">
      {/* Header */}
      <div className="armor-card-header">
        <Camera size={12} className="text-armor-primary" />
        <span className="armor-card-title">LIVE VISION</span>
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Live dot */}
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: cameraHealth === 'ONLINE' ? '#ef4444' : '#6b7280',
                boxShadow: cameraHealth === 'ONLINE' ? '0 0 4px #ef4444' : undefined,
                animation: cameraHealth === 'ONLINE' ? 'pulse 1.5s ease-in-out infinite' : undefined,
              }}
            />
            <span className="font-mono text-[10px]" style={{ color: cameraHealth === 'ONLINE' ? '#ef4444' : '#6b7280' }}>
              {cameraHealth === 'ONLINE' ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <button
            onClick={onExpand}
            className="text-armor-text-dim hover:text-armor-text-primary transition-colors p-0.5"
            title="Expand"
          >
            <Maximize2 size={11} />
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#000' }}>
        {/* Mine tunnel SVG placeholder — realistic dark underground scene */}
        <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="tunnelGrad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#1a1008" />
              <stop offset="60%" stopColor="#0d0a05" />
              <stop offset="100%" stopColor="#030201" />
            </radialGradient>
            <radialGradient id="lightGrad" cx="50%" cy="45%" r="40%">
              <stop offset="0%" stopColor="rgba(255,220,130,0.35)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="led1" cx="22%" cy="88%" r="12%">
              <stop offset="0%" stopColor="rgba(200,220,255,0.8)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="led2" cx="78%" cy="88%" r="12%">
              <stop offset="0%" stopColor="rgba(200,220,255,0.8)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Dark background */}
          <rect width="400" height="250" fill="#030201" />

          {/* Tunnel walls — rough rocky shape */}
          <ellipse cx="200" cy="125" rx="160" ry="115" fill="url(#tunnelGrad)" />
          <ellipse cx="200" cy="125" rx="145" ry="100" fill="url(#lightGrad)" />

          {/* Floor */}
          <ellipse cx="200" cy="240" rx="180" ry="30" fill="#0a0806" />
          <rect x="80" y="230" width="240" height="20" fill="#0a0806" />

          {/* Track rails */}
          <line x1="155" y1="250" x2="170" y2="200" stroke="#2a2018" strokeWidth="2" />
          <line x1="245" y1="250" x2="230" y2="200" stroke="#2a2018" strokeWidth="2" />
          {[230, 218, 206, 194, 207].map((y, i) => (
            <line key={i} x1={155 + (i * 3)} y1={y} x2={245 - (i * 3)} y2={y} stroke="#1a1208" strokeWidth="1.5" />
          ))}

          {/* Roof supports / timber beams */}
          {[0.3, 0.5, 0.7].map((t, i) => {
            const cx = 200; const cy = 125
            const rx = 160 * t; const ry = 115 * t
            return (
              <g key={i} opacity={0.4 - i * 0.1}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#1a1208" strokeWidth="2" strokeDasharray="4,8" />
              </g>
            )
          })}

          {/* Dust particles */}
          {[...Array(12)].map((_, i) => (
            <circle
              key={i}
              cx={60 + (i * 28)}
              cy={80 + Math.sin(i * 1.2) * 40}
              r={0.8 + (i % 3) * 0.4}
              fill="rgba(200,180,140,0.3)"
            />
          ))}

          {/* LED headlights glow */}
          <ellipse cx="200" cy="220" rx="160" ry="25" fill="url(#led1)" />
          <ellipse cx="200" cy="220" rx="160" ry="25" fill="url(#led2)" />
          <circle cx="88" cy="230" r="4" fill="rgba(200,220,255,0.9)" />
          <circle cx="312" cy="230" r="4" fill="rgba(200,220,255,0.9)" />

          {/* AI detection box overlay */}
          {aiOverlay && (
            <g>
              <rect x="130" y="90" width="60" height="80" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2" opacity="0.7" />
              <rect x="130" y="90" width="60" height="12" fill="rgba(34,197,94,0.15)" />
              <text x="133" y="99" fontSize="6" fill="#22c55e" fontFamily="monospace">TUNNEL 94%</text>

              <rect x="240" y="110" width="45" height="55" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" opacity="0.7" />
              <rect x="240" y="110" width="45" height="12" fill="rgba(245,158,11,0.15)" />
              <text x="243" y="119" fontSize="6" fill="#f59e0b" fontFamily="monospace">ROCK 87%</text>
            </g>
          )}

          {/* Zone label */}
          <g>
            <rect x="8" y="8" width="72" height="14" rx="2" fill="rgba(0,0,0,0.6)" stroke="rgba(29,140,248,0.4)" strokeWidth="0.5" />
            <text x="12" y="18" fontSize="7" fill="#8A9BB0" fontFamily="monospace">{zone}</text>
          </g>

          {/* FPS / REC */}
          <g>
            <text x="360" y="18" fontSize="7" fill="#8A9BB0" fontFamily="monospace" textAnchor="end">30 FPS</text>
          </g>
        </svg>

        {/* Corner bracket overlays */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-armor-primary opacity-60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-armor-primary opacity-60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-armor-primary opacity-60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-armor-primary opacity-60" />
      </div>

      {/* Status bar */}
      <div
        className="flex items-center gap-3 px-3 py-1.5 flex-shrink-0"
        style={{ background: '#0D1620', borderTop: '1px solid #1E2D3D' }}
      >
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
          <span className="font-mono text-[10px] text-armor-text-dim">AI: ROCKFALL 94%</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Camera size={10} className="text-armor-text-dim" />
          <Cpu size={10} className="text-armor-text-dim" />
        </div>
      </div>
    </div>
  )
}
