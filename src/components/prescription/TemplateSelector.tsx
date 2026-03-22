import { BookTemplate } from 'lucide-react'
import type { Template, Medication } from '@/types'

interface TemplateSelectorProps {
  templates: Template[]
  onLoad: (medications: Medication[], instructions: string) => void
}

export default function TemplateSelector({ templates, onLoad }: TemplateSelectorProps) {
  if (templates.length === 0) return null

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (!id) return

    const template = templates.find(t => t.id === id)
    if (!template) return

    const meds: Medication[] = template.medications.map((m, i) => ({
      ...m,
      id: `${Date.now()}-${i}`,
    }))

    onLoad(meds, template.instructions)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
      <BookTemplate size={16} className="text-emerald-700 flex-shrink-0" />
      <select
        onChange={handleChange}
        defaultValue=""
        className="flex-1 bg-transparent text-sm text-emerald-800 focus:outline-none cursor-pointer"
      >
        <option value="" disabled>Cargar plantilla guardada...</option>
        {templates.map(t => (
          <option key={t.id} value={t.id}>{t.template_name}</option>
        ))}
      </select>
    </div>
  )
}
