import { Trash2, BookTemplate, Pill } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Template } from '@/types'
import { deleteTemplate } from '@/lib/api/templates'

interface TemplateCardProps {
  template: Template
  onDelete: (id: string) => void
}

export default function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const meds = template.medications as { name: string }[]

  async function handleDelete() {
    if (!confirm(`¿Eliminar la plantilla "${template.template_name}"?`)) return
    try {
      const result = await deleteTemplate(template.id)
      if (result.error) {
        console.error('Error al eliminar:', result.error)
        alert('Error al eliminar: ' + result.error)
        return
      }
      onDelete(template.id)
    } catch (err) {
      console.error('Error inesperado:', err)
      alert('Error al eliminar. Intenta de nuevo.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DCE8DF] shadow-sm hover:shadow-md hover:border-[#C5D9CA] transition-[box-shadow,border-color] overflow-hidden group">
      <div
        className="h-1"
        style={{ background: 'linear-gradient(90deg, #0C1E14, #1B5E35 50%, #00A896)' }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#1B5E3512' }}
            >
              <BookTemplate size={16} style={{ color: '#1B5E35' }} />
            </div>
            <div>
              <h3 className="font-semibold text-[#0D1F17] text-sm tracking-tight">{template.template_name}</h3>
              <p className="text-xs text-[#5A7063] mt-0.5">
                {format(parseISO(template.created_at), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-[background-color,border-color,color]"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="space-y-1.5 mb-3">
          {meds.slice(0, 3).map((med, i) => (
            <div key={i} className="flex items-center gap-2">
              <Pill size={11} className="text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-[#5A7063] truncate">{med.name}</span>
            </div>
          ))}
          {meds.length > 3 && (
            <p className="text-xs text-gray-400 pl-5">+{meds.length - 3} más</p>
          )}
        </div>

        {template.instructions && (
          <p className="text-xs text-gray-400 truncate border-t border-gray-50 pt-2">
            {template.instructions}
          </p>
        )}
      </div>
    </div>
  )
}
