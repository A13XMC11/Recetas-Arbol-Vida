import { supabase } from '@/lib/supabase'
import type { Medication, Template } from '@/types'

type MedicationData = Omit<Medication, 'id'>

export async function createTemplate(data: {
  template_name: string
  medications: MedicationData[]
  instructions: string
}): Promise<{ data?: Template; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: template, error } = await supabase
    .from('templates')
    .insert({ user_id: user.id, ...data })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: template as Template }
}

export async function getTemplates(): Promise<Template[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []) as Template[]
}

export async function deleteTemplate(id: string): Promise<{ error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return {}
}
