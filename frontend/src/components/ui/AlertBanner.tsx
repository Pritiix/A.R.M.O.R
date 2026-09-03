import React from 'react'
import { AlertTriangle, ShieldAlert, X } from 'lucide-react'

export interface AlertBannerProps {
  type?: 'warning' | 'critical' | 'info'
  message: string
  onClose?: () => void
}

export function AlertBanner({ type = 'warning', message, onClose }: AlertBannerProps) {
  const isCritical = type === 'critical'
  const isInfo = type === 'info'

  const color = isCritical ? '#ef4444' : isInfo ? '#60a5fa' : '#f59e0b'
  const bg = isCritical ? 'rgba(239,68,68,0.12)' : isInfo ? 'rgba(96,165,250,0.12)' : 'rgba(245,158,11,0.12)'
  const border = isCritical ? 'rgba(239,68,68,0.35)' : isInfo ? 'rgba(96,165,250,0.35)' : 'rgba(245,158,11,0.35)'

  const Icon = isCritical ? ShieldAlert : AlertTriangle

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 rounded animate-fade-in"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
      }}
    >
      <div className="flex items-center gap-2">
        <Icon size={13} className="flex-shrink-0" style={{ color }} />
        <span className="font-mono font-bold uppercase tracking-widest text-[10px]">
          {message}
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-armor-text-dim hover:text-armor-text-primary p-0.5"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
