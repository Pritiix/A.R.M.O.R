import { useState } from 'react'
import { Camera, Cpu, Sliders, Sparkles } from 'lucide-react'
import { Badge, Button, Card } from '../components/ui'
import { LiveVisionPanel } from '../components/vision/LiveVisionPanel'
import { useARMORStore } from '../store/armorStore'

export function LiveVision() {
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const visionAlerts = useARMORStore((s) => s.visionAlerts)

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Live Vision & Optical Reconnaissance
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            Local Camera Stream & AI Bounding Box Overlay
          </p>
        </div>
        <Badge variant="online" pulse>LOCAL CAMERA</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[450px]">
          <LiveVisionPanel showBoundingBoxes={showBoundingBoxes} />
        </div>

        <div className="space-y-4">
          <Card title="CAMERA STREAM CONTROLS" icon={Sliders}>
            <div className="space-y-3 py-1 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-armor-text-dim">STREAM RESOLUTION:</span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((quality) => (
                    <Button
                      key={quality}
                      variant={streamQuality === quality ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setStreamQuality(quality)}
                      className="flex-1"
                    >
                      {quality.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-armor-border">
                <Button
                  variant={showBoundingBoxes ? 'primary' : 'secondary'}
                  className="w-full justify-center"
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                >
                  <Sparkles size={12} />
                  AI OVERLAYS: {showBoundingBoxes ? 'ENABLED' : 'DISABLED'}
                </Button>
              </div>
            </div>
          </Card>

          <Card title="OPTICAL AI DETECTION LOG" icon={Cpu}>
            <div className="space-y-2 font-mono text-xs py-1">
              {visionAlerts.length === 0 ? (
                <div className="p-2 rounded bg-armor-surface/60 border border-armor-border text-[10px] text-armor-text-dim">
                  Waiting for person detections from ai_engine.py…
                </div>
              ) : visionAlerts.slice(0, 4).map((alert) => (
                <div key={alert.timestamp} className="p-2 rounded bg-armor-surface/60 border border-armor-border">
                  <div className={`flex justify-between font-bold ${alert.status === 'CRITICAL_SURVIVOR' ? 'text-red-400' : 'text-amber-400'}`}>
                    <span>{alert.status}</span>
                    <span>{Math.round(alert.max_confidence * 100)}% CONF</span>
                  </div>
                  <div className="text-[10px] text-armor-text-dim mt-0.5">
                    {alert.person_count} person(s) · {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
