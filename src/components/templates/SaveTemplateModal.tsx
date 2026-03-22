import { useState } from 'react'
import { X, BookmarkPlus } from 'lucide-react'

interface SaveTemplateModalProps {
  onSave: (name: string) => Promise<void>
  onClose: () => void
}

export default function SaveTemplateModal({ onSave, onClose }: SaveTemplateModalProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim())
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
            >
              <BookmarkPlus size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Guardar plantilla</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Guarda esta receta como plantilla para reutilizarla. Solo necesitarás cambiar el nombre del paciente.
        </p>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="Ej: Antibiótico adultos, Gripe niños..."
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400 mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
