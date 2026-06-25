import { useState } from 'react'
import { X, ScanLine, Search } from 'lucide-react'
import { assignBarcode } from '@/lib/api/inventory'
import type { InventoryItemWithStock } from '@/types'

interface AssignBarcodeModalProps {
  barcode: string
  items: InventoryItemWithStock[]
  onAssigned: () => void
  onClose: () => void
}

export default function AssignBarcodeModal({ barcode, items, onAssigned, onClose }: AssignBarcodeModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAssign() {
    if (!selected) return
    setSaving(true)
    setError(null)
    const result = await assignBarcode(selected, barcode)
    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }
    onAssigned()
  }

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="sheet-panel bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

        {/* Handle bar móvil */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <ScanLine size={18} className="text-amber-500" />
              <h2 className="text-base font-bold text-gray-900">Código no encontrado</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg inline-block mb-3">
            {barcode}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            ¿A qué producto pertenece este código?
          </p>

          {/* Buscador */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              autoFocus
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">Sin resultados.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-[background-color,border-color,color,opacity] ${
                    selected === item.id
                      ? 'border-2 border-emerald-400 bg-emerald-50'
                      : 'border border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category} · {item.current_stock} {item.unit}</p>
                  </div>
                  {selected === item.id && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 flex-shrink-0 border-t border-gray-100">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3 text-center">{error}</p>
          )}
          <button
            onClick={handleAssign}
            disabled={!selected || saving}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-40 transition-[background-color,border-color,color,opacity] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
          >
            {saving ? 'Guardando...' : 'Asociar código a este producto'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            La próxima vez se reconocerá automáticamente
          </p>
        </div>
      </div>
    </div>
  )
}
