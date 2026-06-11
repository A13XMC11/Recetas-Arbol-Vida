import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import type { InventoryMovement } from '@/types'

interface MovementHistoryProps {
  movements: InventoryMovement[]
  unit: string
}

function formatMovementDate(dateStr: string): string {
  return format(new Date(dateStr), "d MMM yyyy · HH:mm", { locale: es })
}

export default function MovementHistory({ movements, unit }: MovementHistoryProps) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
        Sin movimientos registrados aún.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {movements.map(m => (
        <div
          key={m.id}
          className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-gray-100"
        >
          {m.type === 'entrada' ? (
            <ArrowDownCircle size={20} className="flex-shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <ArrowUpCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${m.type === 'entrada' ? 'text-emerald-700' : 'text-red-600'}`}>
                {m.type === 'entrada' ? '+' : '-'}{m.quantity} {unit}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatMovementDate(m.created_at)}
              </span>
            </div>
            {m.notes && (
              <p className="text-xs text-gray-500 mt-0.5">{m.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
