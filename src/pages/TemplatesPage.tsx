import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookTemplate, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getProfile } from '@/lib/api/profiles'
import { getTemplates } from '@/lib/api/templates'
import AppShell from '@/components/layout/AppShell'
import TemplateCard from '@/components/templates/TemplateCard'
import type { Profile, Template } from '@/types'

export default function TemplatesPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        const [prof, tmpl] = await Promise.all([getProfile(), getTemplates()])
        setProfile(prof)
        setTemplates(tmpl)
      } catch (err) {
        console.error('Error al cargar datos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  function handleTemplateDeleted(id: string) {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F7F4' }}>
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppShell profile={profile}>
      <div className="min-h-screen" style={{ background: '#F2F7F4' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#0D1F17] tracking-tight">Plantillas</h1>
              <p className="text-[#5A7063] text-sm mt-1">
                Recetas guardadas para reutilizar rápidamente
              </p>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0C1E14 0%, #1B5E35 55%, #00A896 100%)' }}
            >
              <Plus size={16} />
              Nueva receta
            </Link>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DCE8DF] shadow-sm p-16 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#1B5E3510', border: '1px solid #DCE8DF' }}
              >
                <BookTemplate size={28} style={{ color: '#1B5E35' }} />
              </div>
              <h3 className="text-lg font-semibold text-[#0D1F17] mb-2 tracking-tight">Sin plantillas aún</h3>
              <p className="text-[#5A7063] text-sm max-w-sm mx-auto leading-relaxed">
                Crea una receta completa y guárdala como plantilla. La próxima vez solo cambias el nombre del paciente.
              </p>
              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #0C1E14 0%, #1B5E35 55%, #00A896 100%)' }}
              >
                <Plus size={15} />
                Crear primera receta
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...templates]
                .sort((a, b) => a.template_name.localeCompare(b.template_name, 'es', { sensitivity: 'base' }))
                .map(template => (
                  <TemplateCard key={template.id} template={template} onDelete={handleTemplateDeleted} />
                ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
