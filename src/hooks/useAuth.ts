import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
  // undefined = primer run aún no procesado; distingue de null (sin sesión)
  const lastUserIdRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      const userId = u?.id ?? null

      // Solo actualizar user/role cuando la identidad cambia realmente.
      // TOKEN_REFRESHED produce un nuevo objeto User con el mismo ID — ignorarlo
      // evita re-renders en cascada en todas las páginas.
      if (userId !== lastUserIdRef.current) {
        lastUserIdRef.current = userId
        setUser(u)
        if (u) {
          const r = await fetchRole(u.id)
          setRole(r)
        } else {
          setRole(null)
        }
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, role }
}
