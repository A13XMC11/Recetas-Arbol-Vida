import { AlertTriangle } from 'lucide-react'
import type { InventoryItemWithStock } from '@/types'

interface LowStockSummaryProps {
  items: InventoryItemWithStock[]
}

export default function LowStockSummary({ items }: LowStockSummaryProps) {
  const critical = items.filter(i => i.current_stock === 0)
  const low = items.filter(i => i.current_stock > 0 && i.current_stock < i.min_stock)

  if (critical.length === 0 && low.length === 0) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-amber-800">
          Productos que necesitan reposición
        </h3>
      </div>
      <div className="space-y-1.5">
        {critical.map(i => (
          <div key={i.id} className="flex items-center justify-between text-xs">
            <span className="text-gray-700 font-medium">{i.name}</span>
            <span className="text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-lg">
              AGOTADO
            </span>
          </div>
        ))}
        {low.map(i => (
          <div key={i.id} className="flex items-center justify-between text-xs">
            <span className="text-gray-700">{i.name}</span>
            <span className="text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-lg">
              {i.current_stock} {i.unit} · mín. {i.min_stock}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
