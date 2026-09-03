import React from 'react'

export type StatusType = 'online' | 'offline' | 'warning' | 'critical' | 'idle'

export interface StatusIndicatorProps {
  status: StatusType
  label?: string
  pulse?: boolean
  size?: number
}

export function StatusIndicator({ status, label, pulse = true, size = 6 }: StatusIndicatorProps) {
  const colors: Record<StatusType, string> = {
    online: '#22c55e',
    offline: '#6b7280',
    warning: '#f59e0b',
    critical: '#ef4444',
    idle: '#a78bfa',
  }

  const color = colors[status]

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="rounded-full flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: status !== 'offline' ? `0 0 5px ${color}` : undefined,
          animation: pulse && status !== 'offline' ? 'pulse 2s ease-in-out infinite' : undefined,
        }}
      />
      {label && (
        <span
          className="font-mono font-medium uppercase tracking-wider text-armor-text-secondary"
          style={{ fontSize: 10 }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
