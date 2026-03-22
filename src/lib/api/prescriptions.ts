import { supabase } from '@/lib/supabase'
import type { Medication, Prescription } from '@/types'

type MedicationData = Omit<Medication, 'id'>

export async function createPrescription(data: {
  patient_name: string
  date: string
  medications: MedicationData[]
  instructions: string
  next_appointment: string
}): Promise<{ data?: Prescription; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .insert({ user_id: user.id, ...data })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: prescription as Prescription }
}

export async function getPrescriptions(): Promise<Prescription[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (data ?? []) as Prescription[]
}

export async function getPrescriptionById(id: string): Promise<Prescription | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return data as Prescription | null
}

export async function deletePrescription(id: string): Promise<{ error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('prescriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return {}
}
