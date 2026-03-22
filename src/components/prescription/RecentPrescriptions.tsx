import { Link } from 'react-router-dom'
import { FileText, Clock, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Prescription } from '@/types'
import { deletePrescription } from '@/lib/api/prescriptions'

interface RecentPrescriptionsProps {
  prescriptions: Prescription[]
  onDelete: (id: string) => void
}

export default function RecentPrescriptions({ prescriptions, onDelete }: RecentPrescriptionsProps) {
  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta receta?')) return
    await deletePrescription(id)
    onDelete(id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-emerald-600" />
        <h2 className="text-base font-semibold text-gray-800">Recientes</h2>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={32} className="mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">Aún no hay recetas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prescriptions.map(p => (
            <div
              key={p.id}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: '#1B5E3515' }}
              >
                <FileText size={14} style={{ color: '#1B5E35' }} />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/print/${p.id}`}>
                  <p className="text-sm font-medium text-gray-800 truncate hover:underline">
                    {p.patient_name}
                  </p>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {format(parseISO(p.created_at), "d 'de' MMM, HH:mm", { locale: es })}
                </p>
                <p className="text-xs text-gray-400">
                  {(p.medications as { name: string }[]).length} medicamento
                  {(p.medications as { name: string }[]).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
