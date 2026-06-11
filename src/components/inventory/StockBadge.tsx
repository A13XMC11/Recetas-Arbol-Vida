import { cn } from '@/lib/utils/cn'

interface StockBadgeProps {
  current: number
  minimum: number
  unit: string
}

export default function StockBadge({ current, minimum, unit }: StockBadgeProps) {
  const status = current === 0 ? 'critical' : current < minimum ? 'low' : 'ok'

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0',
        status === 'ok' && 'bg-emerald-100 text-emerald-800',
        status === 'low' && 'bg-amber-100 text-amber-800',
        status === 'critical' && 'bg-red-100 text-red-700',
      )}
    >
      {current} {unit}
    </span>
  )
}
