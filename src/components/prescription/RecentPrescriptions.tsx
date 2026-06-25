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
    try {
      const result = await deletePrescription(id)
      if (result.error) {
        console.error('Error al eliminar:', result.error)
        alert('Error al eliminar: ' + result.error)
        return
      }
      onDelete(id)
    } catch (err) {
      console.error('Error inesperado:', err)
      alert('Error al eliminar. Intenta de nuevo.')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#DCE8DF] p-5 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={15} className="text-emerald-600" />
        <h2 className="text-sm font-semibold text-[#0D1F17] tracking-tight">Recientes</h2>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={30} className="mx-auto mb-2" style={{ color: '#C5D9CA' }} />
          <p className="text-sm text-[#5A7063]">Aún no hay recetas</p>
        </div>
      ) : (
        <div className="space-y-1">
          {prescriptions.map((p, idx) => (
            <div
              key={p.id}
              className="fade-up group flex items-start gap-3 p-3 rounded-xl transition-colors duration-150 hover:bg-[#F8FAF9]"
              style={{ animationDelay: `${idx * 35}ms` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#1B5E3510', border: '1px solid #DCE8DF' }}
              >
                <FileText size={13} style={{ color: '#1B5E35' }} />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/print/${p.id}`}>
                  <p className="text-sm font-medium text-[#0D1F17] truncate hover:text-[#1B5E35] transition-colors">
                    {p.patient_name}
                  </p>
                </Link>
                <p className="text-xs text-[#5A7063] mt-0.5">
                  {format(parseISO(p.created_at), "d 'de' MMM, HH:mm", { locale: es })}
                </p>
                <p className="text-xs text-[#9DB5A4]">
                  {(p.medications as { name: string }[]).length} medicamento
                  {(p.medications as { name: string }[]).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-[opacity,color,background-color] duration-150 cursor-pointer"
                style={{ color: '#C5D9CA' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#ef4444'
                  e.currentTarget.style.backgroundColor = '#fef2f2'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#C5D9CA'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
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
