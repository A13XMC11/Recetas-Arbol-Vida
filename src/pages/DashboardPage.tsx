import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getProfile } from '@/lib/api/profiles'
import { getPrescriptions } from '@/lib/api/prescriptions'
import { getTemplates } from '@/lib/api/templates'
import AppShell from '@/components/layout/AppShell'
import PrescriptionForm from '@/components/prescription/PrescriptionForm'
import RecentPrescriptions from '@/components/prescription/RecentPrescriptions'
import type { Profile, Prescription, Template } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        const [prof, presc, tmpl] = await Promise.all([
          getProfile(),
          getPrescriptions(),
          getTemplates(),
        ])
        setProfile(prof)
        setPrescriptions(presc)
        setTemplates(tmpl)
      } catch (err) {
        console.error('Error al cargar datos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  function handlePrescriptionDeleted(id: string) {
    setPrescriptions(prev => prev.filter(p => p.id !== id))
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nueva Receta</h1>
            <p className="text-gray-500 text-sm mt-1">
              Completa los datos del paciente y los medicamentos
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 order-1">
              <PrescriptionForm profile={profile} templates={templates} />
            </div>

            <div className="xl:col-span-1 order-2">
              <RecentPrescriptions
                prescriptions={prescriptions}
                onDelete={handlePrescriptionDeleted}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
