import { Plus } from 'lucide-react'
import type { Medication } from '@/types'
import MedicationItem from './MedicationItem'

interface MedicationListProps {
  medications: Medication[]
  onAdd: () => void
  onChange: (id: string, field: keyof Omit<Medication, 'id'>, value: string) => void
  onRemove: (id: string) => void
}

export default function MedicationList({
  medications,
  onAdd,
  onChange,
  onRemove,
}: MedicationListProps) {
  return (
    <div>
      <div className="space-y-3">
        {medications.map((med, i) => (
          <MedicationItem
            key={med.id}
            medication={med}
            index={i}
            onChange={onChange}
            onRemove={onRemove}
            canRemove={medications.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-all w-full justify-center"
        style={{ borderColor: '#00BFA5', color: '#00897B' }}
        onMouseOver={e => {
          const el = e.currentTarget
          el.style.background = '#00BFA510'
        }}
        onMouseOut={e => {
          const el = e.currentTarget
          el.style.background = 'transparent'
        }}
      >
        <Plus size={16} />
        Agregar medicamento
      </button>
    </div>
  )
}
