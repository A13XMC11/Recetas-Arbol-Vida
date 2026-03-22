import { Trash2 } from 'lucide-react'
import type { Medication } from '@/types'
import { PRESENTATION_OPTIONS, POSOLOGY_PRESETS } from '@/types'

interface MedicationItemProps {
  medication: Medication
  index: number
  onChange: (id: string, field: keyof Omit<Medication, 'id'>, value: string) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

export default function MedicationItem({
  medication,
  index,
  onChange,
  onRemove,
  canRemove,
}: MedicationItemProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'linear-gradient(135deg, #1B5E3510, #00BFA510)' }}
      >
        <span className="text-sm font-semibold" style={{ color: '#1B5E35' }}>
          Medicamento #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(medication.id)}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Nombre del medicamento *
          </label>
          <input
            type="text"
            value={medication.name}
            onChange={e => onChange(medication.id, 'name', e.target.value)}
            placeholder="Ej: Amoxicilina"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Presentación
          </label>
          <input
            type="text"
            value={medication.presentation}
            onChange={e => onChange(medication.id, 'presentation', e.target.value)}
            placeholder="Ej: 500mg cápsulas"
            list={`presentation-${medication.id}`}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
          />
          <datalist id={`presentation-${medication.id}`}>
            {PRESENTATION_OPTIONS.map(opt => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Cantidad
          </label>
          <input
            type="text"
            value={medication.quantity}
            onChange={e => onChange(medication.id, 'quantity', e.target.value)}
            placeholder="Ej: 20 cápsulas"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Posología (dosis y frecuencia)
          </label>
          <input
            type="text"
            value={medication.posology}
            onChange={e => onChange(medication.id, 'posology', e.target.value)}
            placeholder="Ej: 1 cápsula cada 8 horas"
            list={`posology-${medication.id}`}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
          />
          <datalist id={`posology-${medication.id}`}>
            {POSOLOGY_PRESETS.map(opt => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Instrucciones de toma
          </label>
          <input
            type="text"
            value={medication.instructions}
            onChange={e => onChange(medication.id, 'instructions', e.target.value)}
            placeholder="Ej: Tomar con comida, durante 7 días"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  )
}
