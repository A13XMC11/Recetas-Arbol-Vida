import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getProfile, upsertProfile } from '@/lib/api/profiles'
import AppShell from '@/components/layout/AppShell'
import { Save, CheckCircle, UserCircle } from 'lucide-react'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', specialty: 'Medicina General', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    getProfile().then(data => {
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name, specialty: data.specialty, phone: data.phone })
      }
      setLoading(false)
    })
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await upsertProfile(form)
    setProfile(prev => prev ? { ...prev, ...form } : { id: user!.id, ...form })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Configuración de perfil</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tus datos aparecerán automáticamente en cada receta que generes.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
              >
                {form.full_name
                  ? form.full_name.replace(/^Dra?\.\s*/i, '').charAt(0).toUpperCase()
                  : <UserCircle size={28} />
                }
              </div>
              <div>
                <p className="font-semibold text-gray-900">{form.full_name || 'Sin nombre'}</p>
                <p className="text-sm text-gray-400">{form.specialty}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre completo (tal como aparecerá en las recetas)
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Dra. Alexandra Granda Morales"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                  placeholder="Medicina General"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Teléfono de la consulta
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="098 603 5352"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              <div
                className="rounded-xl p-4 text-sm"
                style={{ background: '#1B5E3508', border: '1px solid #1B5E3520' }}
              >
                <p className="font-medium mb-2" style={{ color: '#1B5E35' }}>Vista previa en receta:</p>
                <p className="font-bold text-gray-800">{form.full_name || 'Tu nombre'}</p>
                <p className="text-gray-600">{form.specialty}</p>
                <p className="text-gray-500 text-xs mt-1">Tel: {form.phone || 'sin teléfono'}</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                style={{ background: saved ? '#2E7D32' : 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
              >
                {saved ? (
                  <><CheckCircle size={16} /> Guardado</>
                ) : saving ? (
                  'Guardando...'
                ) : (
                  <><Save size={16} /> Guardar cambios</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
