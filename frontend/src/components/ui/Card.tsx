import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  icon?: React.ElementType
  action?: React.ReactNode
  variant?: 'default' | 'warning' | 'critical'
  noPadding?: boolean
}

export function Card({
  title,
  icon: Icon,
  action,
  variant = 'default',
  noPadding = false,
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  const variantClass =
    variant === 'critical' ? 'hazard-critical' : variant === 'warning' ? 'hazard-warning' : ''

  return (
    <div
      className={`armor-card flex flex-col ${variantClass} ${className}`}
      style={style}
      {...props}
    >
      {(title || Icon || action) && (
        <div className="armor-card-header">
          {Icon && <Icon size={12} className="text-armor-primary flex-shrink-0" />}
          {title && <span className="armor-card-title">{title}</span>}
          {action && <div className="ml-auto flex items-center gap-1.5">{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? '' : 'p-3'} overflow-hidden`}>{children}</div>
    </div>
  )
}
