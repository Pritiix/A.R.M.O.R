import { useState } from 'react'
import { Map, Plus, Minus, Maximize2, Layers, Navigation, Radio, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, Badge, Button, StatusIndicator } from '../components/ui'
import { MineMapSVG } from '../components/maps/MineMapSVG'
import { useARMORStore } from '../store/armorStore'

export function MineMap() {
  const latest = useARMORStore((s) => s.latest)
  const [showNodes, setShowNodes] = useState(true)
  const [showHazards, setShowHazards] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  const zone = latest?.position?.zone ?? 'CORRIDOR_A'
  const x = latest?.position?.x ?? 12.4
  const y = latest?.position?.y ?? 4.2

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Underground Mine Spatial Map & Path Reconnaissance
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            100% Offline Vector SVG Tunnel Topography • Real-Time Telemetry Coordinates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" pulse>
            POSITION SYNC ACTIVE
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Map Viewport (2 Cols) */}
        <div className="lg:col-span-2 h-[520px]">
          <MineMapSVG />
        </div>

        {/* Map Control Sidebar */}
        <div className="space-y-4">
          {/* Live Position & Zone Panel */}
          <Card title="ROVER KINEMATIC POSITION" icon={Navigation}>
            <div className="space-y-3 font-mono text-xs py-1">
              <div className="flex justify-between items-center border-b border-armor-border pb-1.5">
                <span className="text-armor-text-dim">Current Tunnel Zone:</span>
                <span className="text-armor-primary font-bold">{zone}</span>
              </div>
              <div className="flex justify-between items-center border-b border-armor-border pb-1.5">
                <span className="text-armor-text-dim">Coordinates (X, Y):</span>
                <span className="text-armor-text-primary font-bold">X: {x.toFixed(1)}m | Y: {y.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between items-center border-b border-armor-border pb-1.5">
                <span className="text-armor-text-dim">Heading Orientation:</span>
                <span className="text-emerald-400 font-bold">{latest?.rover?.heading ?? 0}° (East)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-armor-text-dim">Explored Distance:</span>
                <span className="text-armor-text-primary font-bold">142.5 meters</span>
              </div>
            </div>
          </Card>

          {/* Map Layer Controls */}
          <Card title="MAP OVERLAY LAYERS" icon={Layers}>
            <div className="space-y-2 py-1 font-mono text-xs">
              <Button
                variant={showNodes ? 'primary' : 'secondary'}
                className="w-full justify-between"
                onClick={() => setShowNodes(!showNodes)}
              >
                <span>COMMUNICATION MESH NODES</span>
                <Radio size={12} />
              </Button>
              <Button
                variant={showHazards ? 'warning' : 'secondary'}
                className="w-full justify-between"
                onClick={() => setShowHazards(!showHazards)}
              >
                <span>GAS & ROCKFALL HAZARD ZONES</span>
                <AlertTriangle size={12} />
              </Button>
              <Button
                variant={showGrid ? 'primary' : 'secondary'}
                className="w-full justify-between"
                onClick={() => setShowGrid(!showGrid)}
              >
                <span>TOPOGRAPHIC GRID LINES</span>
                <Layers size={12} />
              </Button>
            </div>
          </Card>

          {/* Tunnel Sector Legend */}
          <Card title="SECTOR HAZARD INDEX">
            <div className="space-y-2 font-mono text-xs py-1">
              <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
                <span>Sector 1 (Entrance Shaft)</span>
                <Badge variant="online">CLEAR</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
                <span>Sector 2 (Corridor A)</span>
                <Badge variant="online">CLEAR</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
                <span>Sector 3 (Corridor B Deep)</span>
                <Badge variant="warning">GAS DETECTED</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
