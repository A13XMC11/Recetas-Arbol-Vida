import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Clock } from 'lucide-react'

const TIMEOUT_MS = 30 * 60 * 1000  // 30 minutos
const WARNING_MS = 28 * 60 * 1000  // Aviso a los 28 min

export default function InactivityGuard() {
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function reset() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    setShowWarning(false)

    warningRef.current = setTimeout(() => {
      setShowWarning(true)
    }, WARNING_MS)

    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login')
    }, TIMEOUT_MS)
  }

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    const handler = () => reset()

    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    reset()

    return () => {
      events.forEach(e => window.removeEventListener(e, handler))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!showWarning) return null

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm max-w-sm w-[calc(100%-2rem)]"
      style={{ background: '#1B5E35' }}
    >
      <Clock size={18} className="flex-shrink-0" />
      <p className="flex-1">Tu sesión cerrará en 2 minutos por inactividad.</p>
      <button
        onClick={reset}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white font-semibold text-xs transition-opacity hover:opacity-90"
        style={{ color: '#1B5E35' }}
      >
        Seguir conectado
      </button>
    </div>
  )
}
