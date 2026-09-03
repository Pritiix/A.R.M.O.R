/**
 * MiniSparkline — small inline SVG chart used in telemetry cards
 */
import { useARMORStore } from '../../store/armorStore'
import type { TelemetryPacket } from '../../types/telemetry'

interface SparklineProps {
  getValue: (p: TelemetryPacket) => number | null | undefined
  color?: string
  height?: number
  width?: number
}

export function MiniSparkline({ getValue, color = '#1D8CF8', height = 28, width = 64 }: SparklineProps) {
  const history = useARMORStore((s) => s.history)
  const values = history.map(getValue).filter((v): v is number => v !== null && v !== undefined)

  if (values.length < 2) {
    return <svg width={width} height={height} />
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values.slice(-20).map((v, i, arr) => {
    const x = (i / (arr.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
    </svg>
  )
}
