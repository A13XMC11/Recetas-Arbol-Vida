import { useState } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { createMovement } from '@/lib/api/inventory'
import type { InventoryItemWithStock } from '@/types'

interface MovementModalProps {
  item: InventoryItemWithStock
  defaultType?: 'entrada' | 'salida'
  onCreated: () => void
  onClose: () => void
}

export default function MovementModal({ item, defaultType = 'entrada', onCreated, onClose }: MovementModalProps) {
  const [type, setType] = useState<'entrada' | 'salida'>(defaultType)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (quantity < 1) return

    if (type === 'salida' && quantity > item.current_stock) {
      setError(`Stock insuficiente. Disponible: ${item.current_stock} ${item.unit}`)
      return
    }

    setSaving(true)
    setError(null)
    const result = await createMovement({
      item_id: item.id,
      type,
      quantity,
      notes: notes.trim() || undefined,
    })
    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }
    onCreated()
  }

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Registrar movimiento</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tipo de movimiento */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setType('entrada'); setError(null) }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-[background-color,border-color,color,opacity] ${
              type === 'entrada'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <ArrowDownCircle size={16} />
            Entrada
          </button>
          <button
            type="button"
            onClick={() => { setType('salida'); setError(null) }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-[background-color,border-color,color,opacity] ${
              type === 'salida'
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <ArrowUpCircle size={16} />
            Salida
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Cantidad ({item.unit})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={e => { setQuantity(Math.max(1, parseInt(e.target.value) || 1)); setError(null) }}
              min={1}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800"
            />
            {type === 'salida' && (
              <p className="text-xs text-gray-400 mt-1">
                Stock disponible: {item.current_stock} {item.unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Nota (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={type === 'entrada' ? 'Ej: Compra semanal' : 'Ej: Usado en consulta'}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800 placeholder-gray-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-[background-color,border-color,color,opacity]"
              style={{
                background: type === 'entrada'
                  ? 'linear-gradient(135deg, #1B5E35, #00BFA5)'
                  : 'linear-gradient(135deg, #b91c1c, #ef4444)',
              }}
            >
              {saving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
