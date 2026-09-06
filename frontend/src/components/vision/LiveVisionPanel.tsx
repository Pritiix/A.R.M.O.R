import { useEffect, useState } from 'react'
import { AlertTriangle, Camera, Maximize2, WifiOff } from 'lucide-react'
import { useARMORStore } from '../../store/armorStore'

interface Props {
  onExpand?: () => void
  showBoundingBoxes?: boolean
}

type StreamState = 'connecting' | 'live' | 'error'
const ENGINE_STREAM_URL = import.meta.env.VITE_VISION_STREAM_URL ?? 'http://127.0.0.1:8081/stream.mjpg'

/** Displays the MJPEG stream owned by ai/ai_engine.py, avoiding a second webcam client. */
export function LiveVisionPanel({ onExpand, showBoundingBoxes = true }: Props) {
  const [streamState, setStreamState] = useState<StreamState>('connecting')
  const [retry, setRetry] = useState(0)
  const latestVisionAlert = useARMORStore((s) => s.latestVisionAlert)

  useEffect(() => {
    if (streamState !== 'error') return
    const timer = window.setTimeout(() => {
      setStreamState('connecting')
      setRetry((value) => value + 1)
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [streamState])

  const isLive = streamState === 'live'
  const status = latestVisionAlert?.status
  const frameWidth = latestVisionAlert?.frame_width ?? 1
  const frameHeight = latestVisionAlert?.frame_height ?? 1

  return (
    <div className="armor-card h-full flex flex-col">
      <div className="armor-card-header">
        <Camera size={12} className="text-armor-primary" />
        <span className="armor-card-title">LIVE VISION</span>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isLive ? '#ef4444' : '#6b7280', boxShadow: isLive ? '0 0 4px #ef4444' : undefined }} />
            <span className="font-mono text-[10px]" style={{ color: isLive ? '#ef4444' : '#6b7280' }}>
              {isLive ? 'LIVE' : streamState === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
            </span>
          </div>
          <button onClick={onExpand} className="text-armor-text-dim hover:text-armor-text-primary transition-colors p-0.5" title="Expand">
            <Maximize2 size={11} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black">
        <img
          key={retry}
          src={ENGINE_STREAM_URL}
          alt="A.R.M.O.R. AI engine camera stream"
          className="w-full h-full object-cover"
          onLoad={() => setStreamState('live')}
          onError={() => setStreamState('error')}
        />

        {streamState === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-armor-text-dim">
            CONNECTING TO AI ENGINE CAMERA…
          </div>
        )}
        {streamState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <WifiOff size={22} className="text-armor-warning" />
            <span className="font-mono text-xs text-armor-warning">AI ENGINE CAMERA UNAVAILABLE</span>
            <span className="font-mono text-[10px] text-armor-text-dim">Start ai/ai_engine.py, then this panel will reconnect automatically.</span>
          </div>
        )}

        {showBoundingBoxes && isLive && latestVisionAlert?.person_detected && latestVisionAlert.detections.map((detection, index) => {
          const [x1, y1, x2, y2] = detection.bbox_xyxy
          const color = status === 'CRITICAL_SURVIVOR' ? '#ef4444' : '#f59e0b'
          return (
            <div key={`${latestVisionAlert.timestamp}-${index}`} className="absolute border-2" style={{ left: `${(x1 / frameWidth) * 100}%`, top: `${(y1 / frameHeight) * 100}%`, width: `${((x2 - x1) / frameWidth) * 100}%`, height: `${((y2 - y1) / frameHeight) * 100}%`, borderColor: color }}>
              <span className="absolute -top-5 left-0 whitespace-nowrap px-1 font-mono text-[10px] font-bold text-black" style={{ background: color }}>
                PERSON {Math.round(detection.confidence * 100)}%
              </span>
            </div>
          )
        })}

        <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-armor-primary opacity-60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-armor-primary opacity-60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-armor-primary opacity-60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-armor-primary opacity-60" />
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0" style={{ background: '#0D1620', borderTop: '1px solid #1E2D3D' }}>
        {latestVisionAlert ? <><AlertTriangle size={11} className={status === 'CRITICAL_SURVIVOR' ? 'text-red-400' : 'text-amber-400'} /><span className="font-mono text-[10px] text-armor-text-primary">AI: {status} · {latestVisionAlert.person_count} PERSON</span></> : <span className="font-mono text-[10px] text-armor-text-dim">AI: WAITING FOR ENGINE ALERTS</span>}
      </div>
    </div>
  )
}
