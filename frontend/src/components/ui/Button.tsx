import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ElementType
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  children,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles: Record<ButtonVariant, { bg: string; border: string; color: string; hoverBg: string }> = {
    primary: {
      bg: 'rgba(29,140,248,0.15)',
      border: 'rgba(29,140,248,0.4)',
      color: '#1D8CF8',
      hoverBg: 'rgba(29,140,248,0.25)',
    },
    secondary: {
      bg: 'rgba(30,45,61,0.6)',
      border: 'rgba(30,45,61,0.9)',
      color: '#8A9BB0',
      hoverBg: 'rgba(30,45,61,0.9)',
    },
    danger: {
      bg: 'rgba(239,68,68,0.15)',
      border: 'rgba(239,68,68,0.4)',
      color: '#ef4444',
      hoverBg: 'rgba(239,68,68,0.25)',
    },
    warning: {
      bg: 'rgba(245,158,11,0.15)',
      border: 'rgba(245,158,11,0.4)',
      color: '#f59e0b',
      hoverBg: 'rgba(245,158,11,0.25)',
    },
    ghost: {
      bg: 'transparent',
      border: 'transparent',
      color: '#8A9BB0',
      hoverBg: 'rgba(30,45,61,0.5)',
    },
  }

  const paddingMap = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }

  const v = variantStyles[variant]

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded font-mono font-semibold tracking-wider uppercase transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${paddingMap[size]} ${className}`}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.color,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${v.color} transparent ${v.color} ${v.color}` }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 11 : size === 'md' ? 13 : 15} />
      ) : null}
      {children}
    </button>
  )
}
