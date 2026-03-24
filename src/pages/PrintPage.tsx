import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getPrescriptionById } from '@/lib/api/prescriptions'
import { getProfile } from '@/lib/api/profiles'
import PrescriptionPrint from '@/components/print/PrescriptionPrint'
import PrintControls from '@/components/print/PrintControls'
import ScaledPreview from '@/components/print/ScaledPreview'
import type { Prescription, Profile } from '@/types'

// A5 landscape at 96dpi: 210mm × 148mm → 794px × 559px
const A5_W = 794
const A5_H = 559

export default function PrintPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // 🔥 Corrección: manejar correctamente cuando id o user no existen
    if (!user || !id) {
      setLoading(false)
      setNotFound(true)
      return
    }

    const prescriptionId = id

    async function loadData() {
      try {
        const [presc, prof] = await Promise.all([
          getPrescriptionById(prescriptionId),
          getProfile(),
        ])

        if (!presc) {
          setNotFound(true)
        } else {
          setPrescription(presc)
          setProfile(prof)
        }
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#e8f5e9' }}>
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !prescription) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      {/* Portal al body — fuera de #root para que el CSS print lo pueda mostrar */}
      {createPortal(
        <div id="print-root" style={{ display: 'none' }}>
          <PrescriptionPrint prescription={prescription} profile={profile} />
        </div>,
        document.body
      )}

      {/* Vista en pantalla */}
      <div className="min-h-screen flex flex-col" style={{ background: '#e8f5e9' }}>
        <PrintControls />

        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <ScaledPreview naturalWidth={A5_W} naturalHeight={A5_H}>
            <PrescriptionPrint prescription={prescription} profile={profile} />
          </ScaledPreview>
          <p className="mt-4 text-xs text-gray-400 text-center px-4">
            Vista previa de la receta — A5 horizontal
          </p>
        </div>
      </div>
    </>
  )
}