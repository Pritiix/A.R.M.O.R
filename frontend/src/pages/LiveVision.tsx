import { useState } from 'react'
import { Eye, Camera, RefreshCw, Sliders, ShieldAlert, Cpu, Sparkles } from 'lucide-react'
import { Card, Badge, Button, StatusIndicator } from '../components/ui'
import { LiveVisionPanel } from '../components/vision/LiveVisionPanel'

export function LiveVision() {
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Live Vision & Optical Reconnaissance
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            ESP32-CAM MJPEG Video Stream & AI Bounding Box Overlay
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="online" pulse>
            CAM STREAM ACTIVE
          </Badge>
        </div>
      </div>

      {/* Camera Stream + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[450px]">
          <LiveVisionPanel />
        </div>

        <div className="space-y-4">
          <Card title="CAMERA STREAM CONTROLS" icon={Sliders}>
            <div className="space-y-3 py-1 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-armor-text-dim">STREAM RESOLUTION:</span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <Button
                      key={q}
                      variant={streamQuality === q ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setStreamQuality(q)}
                      className="flex-1"
                    >
                      {q.toUpperCase()}
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
              <div className="p-2 rounded bg-armor-surface/60 border border-armor-border">
                <div className="flex justify-between text-red-400 font-bold">
                  <span>⚠ ROCKFALL IMPACT</span>
                  <span>94% CONF</span>
                </div>
                <div className="text-[10px] text-armor-text-dim mt-0.5">Corridor B • Bounding Box [130, 90, 60, 80]</div>
              </div>
              <div className="p-2 rounded bg-armor-surface/60 border border-armor-border">
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>⚠ ELEVATED GAS / SMOKE</span>
                  <span>91% CONF</span>
                </div>
                <div className="text-[10px] text-armor-text-dim mt-0.5">Corridor A • Density Estimation</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
