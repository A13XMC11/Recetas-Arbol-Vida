import { useState } from 'react'
import { X, Minus, Plus, Check, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { createMovement } from '@/lib/api/inventory'
import StockBadge from './StockBadge'
import type { InventoryItemWithStock } from '@/types'

interface QuickMovementModalProps {
  item: InventoryItemWithStock
  onDone: () => void
  onClose: () => void
}

const QUICK_AMOUNTS = [1, 2, 3, 5, 10]

export default function QuickMovementModal({ item, onDone, onClose }: QuickMovementModalProps) {
  const [type, setType] = useState<'salida' | 'entrada'>('salida')
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function adjust(delta: number) {
    setQuantity(q => Math.max(1, q + delta))
    setError(null)
  }

  async function handleConfirm() {
    if (type === 'salida' && quantity > item.current_stock) {
      setError(`Stock insuficiente. Disponible: ${item.current_stock} ${item.unit}`)
      return
    }
    setSaving(true)
    setError(null)
    const result = await createMovement({ item_id: item.id, type, quantity })
    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }
    setDone(true)
    setTimeout(onDone, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Handle bar móvil */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {done ? (
          /* Estado de éxito */
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-100">
              <Check size={32} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-gray-800">
              {type === 'salida' ? `-${quantity}` : `+${quantity}`} {item.unit} registrado
            </p>
          </div>
        ) : (
          <div className="px-5 pb-6 pt-3">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-base font-bold text-gray-900 truncate">{item.name}</h2>
                <div className="mt-1">
                  <StockBadge current={item.current_stock} minimum={item.min_stock} unit={item.unit} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tipo de movimiento */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                onClick={() => { setType('salida'); setError(null) }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  type === 'salida'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                <ArrowUpCircle size={15} />
                Usé / Salida
              </button>
              <button
                onClick={() => { setType('entrada'); setError(null) }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  type === 'entrada'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                <ArrowDownCircle size={15} />
                Ingresó / Entrada
              </button>
            </div>

            {/* Cantidades rápidas */}
            <div className="flex gap-2 mb-4">
              {QUICK_AMOUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => { setQuantity(n); setError(null) }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    quantity === n
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={quantity === n ? {
                    background: type === 'salida'
                      ? 'linear-gradient(135deg, #b91c1c, #ef4444)'
                      : 'linear-gradient(135deg, #1B5E35, #00BFA5)'
                  } : undefined}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Control manual de cantidad */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => adjust(-1)}
                disabled={quantity <= 1}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <Minus size={18} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-gray-900">{quantity}</span>
                <span className="text-sm text-gray-400 ml-1.5">{item.unit}</span>
              </div>
              <button
                onClick={() => adjust(1)}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3 text-center">
                {error}
              </p>
            )}

            {/* Botón principal */}
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-all active:scale-95"
              style={{
                background: type === 'salida'
                  ? 'linear-gradient(135deg, #b91c1c, #ef4444)'
                  : 'linear-gradient(135deg, #1B5E35, #00BFA5)',
              }}
            >
              {saving ? 'Guardando...' : (
                type === 'salida'
                  ? `Registrar −${quantity} ${item.unit}`
                  : `Registrar +${quantity} ${item.unit}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
