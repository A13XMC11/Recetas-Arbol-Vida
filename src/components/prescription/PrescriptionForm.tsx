import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Printer, BookmarkPlus } from 'lucide-react'
import type { Profile, Template, Medication, PrescriptionFormState } from '@/types'
import { getTodayISO } from '@/lib/utils/dateUtils'
import { createPrescription } from '@/lib/api/prescriptions'
import { createTemplate } from '@/lib/api/templates'
import MedicationList from './MedicationList'
import TemplateSelector from './TemplateSelector'
import SaveTemplateModal from '@/components/templates/SaveTemplateModal'

function emptyMedication(id?: string): Medication {
  return {
    id: id ?? crypto.randomUUID(),
    name: '',
    presentation: '',
    quantity: '',
    posology: '',
    instructions: '',
  }
}

const INITIAL_MED_ID = 'med-initial'

interface PrescriptionFormProps {
  profile: Profile | null
  templates: Template[]
}

export default function PrescriptionForm({ profile, templates }: PrescriptionFormProps) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const [form, setForm] = useState<PrescriptionFormState>({
    patientName: '',
    date: getTodayISO(),
    medications: [emptyMedication(INITIAL_MED_ID)],
    instructions: '',
    nextAppointment: '',
  })

  const addMedication = useCallback(() => {
    setForm(f => ({ ...f, medications: [...f.medications, emptyMedication()] }))
  }, [])

  const removeMedication = useCallback((id: string) => {
    setForm(f => ({ ...f, medications: f.medications.filter(m => m.id !== id) }))
  }, [])

  const changeMedication = useCallback(
    (id: string, field: keyof Omit<Medication, 'id'>, value: string) => {
      setForm(f => ({
        ...f,
        medications: f.medications.map(m => m.id === id ? { ...m, [field]: value } : m),
      }))
    },
    []
  )

  function loadTemplate(medications: Medication[], instructions: string) {
    setForm(f => ({ ...f, medications, instructions }))
  }

  async function handleSaveAndPrint() {
    if (!form.patientName.trim()) {
      alert('Por favor ingresa el nombre del paciente.')
      return
    }

    setSaving(true)
    try {
      const meds = form.medications.map(({ id: _id, ...rest }) => rest)

      const result = await createPrescription({
        patient_name: form.patientName,
        date: form.date,
        medications: meds,
        instructions: form.instructions,
        next_appointment: form.nextAppointment,
      })

      if (result.error) {
        console.error('Error al guardar:', result.error)
        alert('Error al guardar: ' + result.error)
        return
      }

      navigate(`/print/${result.data!.id}`)
    } catch (err) {
      console.error('Error inesperado:', err)
      alert('Error inesperado al guardar la receta. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveTemplate(name: string) {
    try {
      const meds = form.medications.map(({ id: _id, ...rest }) => rest)
      const result = await createTemplate({
        template_name: name,
        medications: meds,
        instructions: form.instructions,
      })
      if (result.error) {
        console.error('Error al guardar plantilla:', result.error)
        alert('Error al guardar plantilla: ' + result.error)
        return
      }
      setShowTemplateModal(false)
    } catch (err) {
      console.error('Error inesperado al guardar plantilla:', err)
      alert('Error al guardar plantilla. Intenta de nuevo.')
    }
  }

  return (
    <>
      <div className="space-y-6">
        <TemplateSelector templates={templates} onLoad={loadTemplate} />

        <div className="bg-white rounded-2xl shadow-sm border border-[#DCE8DF] p-5">
          <h2 className="text-sm font-semibold text-[#0D1F17] mb-4 tracking-tight">Datos del paciente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A7063] mb-1.5">
                Nombre del paciente *
              </label>
              <input
                type="text"
                value={form.patientName}
                onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                placeholder="Nombre completo"
                className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] placeholder-[#9DB5A4]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A7063] mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#DCE8DF] p-5">
          <h2 className="text-sm font-semibold text-[#0D1F17] mb-4 tracking-tight">
            Rp. — Medicamentos
          </h2>
          <MedicationList
            medications={form.medications}
            onAdd={addMedication}
            onChange={changeMedication}
            onRemove={removeMedication}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#DCE8DF] p-5">
          <h2 className="text-sm font-semibold text-[#0D1F17] mb-4 tracking-tight">Indicaciones</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A7063] mb-1.5">
                Indicaciones y cuidados
              </label>
              <textarea
                value={form.instructions}
                onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                placeholder="Ej: Reposo relativo, hidratación abundante, evitar esfuerzo físico..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] placeholder-[#9DB5A4] resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A7063] mb-1.5">
                Próxima cita
              </label>
              <input
                type="text"
                value={form.nextAppointment}
                onChange={e => setForm(f => ({ ...f, nextAppointment: e.target.value }))}
                placeholder="Ej: En 7 días, 25 de marzo de 2026"
                className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] placeholder-[#9DB5A4]"
              />
            </div>
          </div>
        </div>

        {profile && (
          <div
            className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
            style={{ background: '#1B5E3510', borderLeft: '3px solid #1B5E35' }}
          >
            <div style={{ color: '#1B5E35' }} className="font-medium">{profile.full_name}</div>
            <div className="text-gray-400 hidden sm:block">·</div>
            <div className="text-gray-500">{profile.specialty}</div>
            {profile.phone && (
              <>
                <div className="text-gray-400 hidden sm:block">·</div>
                <div className="text-gray-500">{profile.phone}</div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSaveAndPrint}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #0C1E14 0%, #1B5E35 55%, #00A896 100%)',
              transition: 'all 180ms cubic-bezier(0.23, 1, 0.32, 1)',
              opacity: saving ? 0.6 : 1,
              transform: saving ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseDown={(e) => {
              if (!saving) e.currentTarget.style.transform = 'scale(0.96)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <Printer size={16} />
            {saving ? 'Guardando...' : 'Guardar e Imprimir'}
          </button>

          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 font-semibold text-sm cursor-pointer"
            style={{
              borderColor: '#00A896',
              color: '#00897B',
              transition: 'all 180ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.96)'
              e.currentTarget.style.backgroundColor = '#f0f7f4'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <BookmarkPlus size={16} />
            Guardar como plantilla
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({
                patientName: '',
                date: getTodayISO(),
                medications: [emptyMedication()],
                instructions: '',
                nextAppointment: '',
              })
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#DCE8DF] text-[#5A7063] font-medium text-sm cursor-pointer"
            style={{
              transition: 'all 180ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.96)'
              e.currentTarget.style.backgroundColor = '#f5f5f5'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Save size={16} />
            Nueva receta
          </button>
        </div>
      </div>

      {showTemplateModal && (
        <SaveTemplateModal
          onSave={handleSaveTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </>
  )
}
