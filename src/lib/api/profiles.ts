import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export async function upsertProfile(data: {
  full_name: string
  specialty: string
  phone: string
}): Promise<{ error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...data, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }
  return {}
}

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Profile | null
}
