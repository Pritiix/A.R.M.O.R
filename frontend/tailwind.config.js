/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // A.R.M.O.R. Industrial Palette
        armor: {
          bg: '#0B1117',
          card: '#111A23',
          border: '#1E2D3D',
          surface: '#162030',
          // Primary — Electric Blue
          primary: '#1D8CF8',
          'primary-dim': '#1565C0',
          // Secondary — Steel Cyan
          secondary: '#00B4D8',
          'secondary-dim': '#0077B6',
          // Status
          safe: '#22c55e',
          warning: '#f59e0b',
          critical: '#ef4444',
          offline: '#6b7280',
          // Text
          'text-primary': '#E8EDF2',
          'text-secondary': '#8A9BB0',
          'text-dim': '#4A5568',
          // Accent
          accent: '#00D4FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(29, 140, 248, 0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(29, 140, 248, 0.03) 1px, transparent 1px)`,
        'scanline': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.01) 2px, rgba(0,212,255,0.01) 4px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'armor': '0 0 0 1px rgba(29, 140, 248, 0.15), 0 4px 24px rgba(0, 0, 0, 0.4)',
        'armor-glow': '0 0 20px rgba(29, 140, 248, 0.2)',
        'critical-glow': '0 0 20px rgba(239, 68, 68, 0.3)',
        'warning-glow': '0 0 20px rgba(245, 158, 11, 0.3)',
        'safe-glow': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1.2s step-end infinite',
        'scan': 'scan 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
