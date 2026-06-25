import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getProfile, upsertProfile } from '@/lib/api/profiles'
import AppShell from '@/components/layout/AppShell'
import { Save, CheckCircle, UserCircle } from 'lucide-react'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const { user, role } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', specialty: 'Medicina General', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        const data = await getProfile()
        if (data) {
          setProfile(data)
          setForm({ full_name: data.full_name, specialty: data.specialty, phone: data.phone })
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await upsertProfile(form)
      if (result.error) {
        console.error('Error al guardar perfil:', result.error)
        alert('Error al guardar: ' + result.error)
        setSaving(false)
        return
      }
      setProfile(prev => prev ? { ...prev, ...form } : { id: user!.id, role: role ?? 'doctor', ...form })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error inesperado:', err)
      alert('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
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
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0D1F17] tracking-tight">Configuración de perfil</h1>
            <p className="text-[#5A7063] text-sm mt-1">
              Tus datos aparecerán automáticamente en cada receta que generes.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#DCE8DF] p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#EEF3EF]">
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
                <label className="block text-sm font-semibold text-[#2D3C35] mb-2">
                  Nombre completo (tal como aparecerá en las recetas)
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Dra. Alexandra Granda Morales"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] placeholder-[#9DB5A4]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D3C35] mb-2">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                  placeholder="Medicina General"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] placeholder-[#9DB5A4]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D3C35] mb-2">
                  Teléfono de la consulta
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="098 603 5352"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] placeholder-[#9DB5A4]"
                />
              </div>

              <div className="rounded-xl p-4 text-sm bg-[#F2F7F4] border border-[#DCE8DF]">
                <p className="font-semibold mb-2 text-[#1B5E35]">Vista previa en receta:</p>
                <p className="font-bold text-[#0D1F17]">{form.full_name || 'Tu nombre'}</p>
                <p className="text-[#5A7063]">{form.specialty}</p>
                <p className="text-[#5A7063] text-xs mt-1">Tel: {form.phone || 'sin teléfono'}</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-[background-color,border-color,color] disabled:opacity-60"
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
