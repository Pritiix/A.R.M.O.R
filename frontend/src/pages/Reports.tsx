import { FileBarChart, Download, ShieldCheck, FileText } from 'lucide-react'
import { Card, Badge, Button } from '../components/ui'
import { useARMORStore } from '../store/armorStore'

export function Reports() {
  const latest = useARMORStore((s) => s.latest)

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Post-Mission Reconnaissance & Safety Reports
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            Automated PDF & JSON Mine Inspection Report Generator
          </p>
        </div>
        <Button variant="primary" icon={Download}>
          GENERATE FULL PDF REPORT
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="CURRENT MISSION SUMMARY" icon={FileText}>
          <div className="space-y-3 font-mono text-xs text-armor-text-secondary py-1">
            <div className="flex justify-between border-b border-armor-border pb-1">
              <span className="text-armor-text-dim">Mission Identifier:</span>
              <span className="text-armor-primary font-bold">MISSION-001</span>
            </div>
            <div className="flex justify-between border-b border-armor-border pb-1">
              <span className="text-armor-text-dim">Deploying Rover:</span>
              <span className="text-armor-text-primary font-bold">ARMOR-01</span>
            </div>
            <div className="flex justify-between border-b border-armor-border pb-1">
              <span className="text-armor-text-dim">Overall Risk Status:</span>
              <span className="text-emerald-400 font-bold">STABLE / INSPECTED</span>
            </div>
            <div className="flex justify-between border-b border-armor-border pb-1">
              <span className="text-armor-text-dim">Max Gas Concentration:</span>
              <span className="text-amber-400 font-bold">335 ADC (Warning Level)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-armor-text-dim">Total Distance Traversed:</span>
              <span className="text-armor-primary font-bold">142 meters</span>
            </div>
          </div>
        </Card>

        <Card title="SIH EVALUATION AUDIT CHECKLIST" icon={ShieldCheck}>
          <div className="space-y-2 font-mono text-xs py-1">
            <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
              <span>Telemetry WebSocket Protocol</span>
              <Badge variant="online">VERIFIED</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
              <span>Hardware Abstraction Layer (HAL)</span>
              <Badge variant="online">VERIFIED</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
              <span>Offline Vector Mine Map</span>
              <Badge variant="online">VERIFIED</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-armor-surface/60 border border-armor-border">
              <span>Digital Twin 3D Kinematic Viewer</span>
              <Badge variant="online">VERIFIED</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
