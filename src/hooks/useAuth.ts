import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Role = 'doctor' | 'admin' | null

interface AuthContextValue {
  user: User | null
  loading: boolean
  role: Role
}

export const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, role: null })

export function useAuth() {
  return useContext(AuthContext)
}

async function fetchRole(userId: string): Promise<Role> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return (data?.role as Role) ?? 'doctor'
}

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<Role>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) {
        const r = await fetchRole(u.id)
        setRole(r)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const r = await fetchRole(u.id)
        setRole(r)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, role }
}
