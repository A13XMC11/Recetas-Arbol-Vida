import { useState } from 'react'
import { X } from 'lucide-react'
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from '@/types'
import type { InventoryCategory, InventoryUnit } from '@/types'
import { createInventoryItem } from '@/lib/api/inventory'

interface AddItemModalProps {
  onCreated: () => void
  onClose: () => void
}

export default function AddItemModal({ onCreated, onClose }: AddItemModalProps) {
  const [form, setForm] = useState({
    name: '',
    category: 'Otros' as InventoryCategory,
    unit: 'unidad' as InventoryUnit,
    min_stock: 5,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    const result = await createInventoryItem(form)
    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Nuevo producto</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Lidocaína 2%, Jeringas 5ml, Fundas de basura"
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as InventoryCategory }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 bg-white"
              >
                {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Unidad</label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value as InventoryUnit }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 bg-white"
              >
                {INVENTORY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Stock mínimo — alerta cuando esté por debajo de este número
            </label>
            <input
              type="number"
              value={form.min_stock}
              onChange={e => setForm(f => ({ ...f, min_stock: Math.max(1, parseInt(e.target.value) || 1) }))}
              min={1}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800"
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
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
            >
              {saving ? 'Guardando...' : 'Agregar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
