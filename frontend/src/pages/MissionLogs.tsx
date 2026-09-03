import { useState } from 'react'
import { ScrollText, Filter, Download, Search } from 'lucide-react'
import { Card, Badge, Button } from '../components/ui'
import { useARMORStore } from '../store/armorStore'

export function MissionLogs() {
  const [filter, setFilter] = useState<string>('ALL')
  const events = useARMORStore((s) => s.missionEvents)

  const mockLogs = [
    { id: 101, time: '20:42:36', type: 'CRITICAL', zone: 'Corridor B', msg: 'Rockfall Impact Detected by Optical AI' },
    { id: 102, time: '20:41:36', type: 'WARNING', zone: 'Corridor A', msg: 'Elevated Gas Level Detected (MQ-2 ADC: 335)' },
    { id: 103, time: '20:40:00', type: 'INFO', zone: 'Corridor A', msg: 'Relay Node 02 Connected' },
    { id: 104, time: '20:38:12', type: 'INFO', zone: 'Pit Entrance', msg: 'Mission Started by Operator' },
  ]

  const filteredLogs = mockLogs.filter((l) => filter === 'ALL' || l.type === filter)

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            SQLite Mission Event Journal & Audit Log
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            Persistent Incident Storage & Timestamped Hazard Logs
          </p>
        </div>
        <Button variant="secondary" icon={Download}>
          EXPORT CSV
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4 font-mono text-xs">
          <Filter size={14} className="text-armor-text-dim" />
          <span className="text-armor-text-dim">FILTER BY SEVERITY:</span>
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-armor-border text-armor-text-dim uppercase text-[10px]">
                <th className="py-2 px-3">EVENT ID</th>
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">SEVERITY</th>
                <th className="py-2 px-3">ZONE</th>
                <th className="py-2 px-3">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-armor-border/40 text-armor-text-secondary">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-armor-surface/50">
                  <td className="py-2 px-3 text-armor-primary font-bold">#{log.id}</td>
                  <td className="py-2 px-3 text-armor-text-dim">{log.time}</td>
                  <td className="py-2 px-3">
                    <Badge variant={log.type === 'CRITICAL' ? 'critical' : log.type === 'WARNING' ? 'warning' : 'info'}>
                      {log.type}
                    </Badge>
                  </td>
                  <td className="py-2 px-3">{log.zone}</td>
                  <td className="py-2 px-3">{log.msg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
