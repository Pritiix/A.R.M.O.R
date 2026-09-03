import React from 'react'

export interface MetricDisplayProps {
  label: string
  value: string | number | null
  unit?: string
  color?: string
  status?: string
  icon?: React.ElementType
}

export function MetricDisplay({
  label,
  value,
  unit,
  color = '#E8EDF2',
  status,
  icon: Icon,
}: MetricDisplayProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="metric-label">{label}</span>
        {Icon && <Icon size={12} style={{ color }} />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="metric-value" style={{ color: value === null ? '#6b7280' : color }}>
          {value !== null && value !== undefined ? value : '--'}
        </span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {status && (
        <span
          className="font-mono text-[9px] font-bold tracking-wider uppercase"
          style={{ color }}
        >
          {status}
        </span>
      )}
    </div>
  )
}
