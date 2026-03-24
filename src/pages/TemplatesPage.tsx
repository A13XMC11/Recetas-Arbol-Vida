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
  }, [user])

  function handleTemplateDeleted(id: string) {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f7f4' }}>
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppShell profile={profile}>
      <div className="min-h-screen" style={{ background: '#f0f7f4' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
              <p className="text-gray-500 text-sm mt-1">
                Recetas guardadas para reutilizar rápidamente
              </p>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
            >
              <Plus size={16} />
              Nueva receta
            </Link>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#1B5E3512' }}
              >
                <BookTemplate size={28} style={{ color: '#1B5E35' }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin plantillas</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Crea una receta completa y guárdala como plantilla. La próxima vez solo cambias el nombre del paciente.
              </p>
              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
              >
                <Plus size={15} />
                Crear primera receta
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} onDelete={handleTemplateDeleted} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
