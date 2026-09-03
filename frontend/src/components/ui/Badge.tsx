import React from 'react'

export type BadgeVariant = 'online' | 'offline' | 'warning' | 'critical' | 'info' | 'primary'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  pulse?: boolean
  size?: 'sm' | 'md'
}

export function Badge({
  variant = 'info',
  pulse = false,
  size = 'md',
  children,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const styles: Record<BadgeVariant, { color: string; bg: string; border: string }> = {
    online: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
    offline: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    info: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
    primary: { color: '#1D8CF8', bg: 'rgba(29,140,248,0.12)', border: 'rgba(29,140,248,0.3)' },
  }

  const s = styles[variant]
  const fontPx = size === 'sm' ? 8 : 9
  const padding = size === 'sm' ? '1px 4px' : '2px 6px'

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold tracking-wider uppercase rounded ${className}`}
      style={{
        fontSize: fontPx,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding,
        lineHeight: 1,
        ...style,
      }}
      {...props}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{
            background: s.color,
            boxShadow: `0 0 4px ${s.color}`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </span>
  )
}
