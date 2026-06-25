import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import TreeLogo from '@/components/logo/TreeLogo'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        console.error('Error de autenticación:', authError)
        setError('Correo o contraseña incorrectos.')
        return
      }

      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Error inesperado:', err)
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — dark forest premium */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden bg-[#0C1E14]">
        {/* Decorative organic circles */}
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#1B5E35]/25 pointer-events-none" />
        <div className="absolute -bottom-56 -left-40 w-[640px] h-[640px] rounded-full bg-[#00A896]/10 pointer-events-none" />
        <div className="absolute top-[38%] right-[8%] w-[220px] h-[220px] rounded-full bg-emerald-500/[0.07] pointer-events-none" />
        <div className="absolute bottom-[22%] left-[12%] w-[140px] h-[140px] rounded-full bg-[#1B5E35]/20 pointer-events-none" />

        {/* Subtle leaf watermark */}
        <div className="absolute bottom-8 right-10 opacity-[0.04] pointer-events-none select-none">
          <TreeLogo size={280} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <TreeLogo size={38} />
            <p className="text-white/60 text-sm font-medium tracking-wide">Fundación Árbol de Vida</p>
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <p className="text-emerald-400/80 text-xs font-semibold tracking-[0.18em] uppercase mb-5">
              Sistema Médico
            </p>
            <h1 className="text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight">
              Cuidado<br />con<br />propósito.
            </h1>
            <p className="mt-7 text-white/40 text-base leading-relaxed">
              Cada receta refleja el compromiso con la salud integral de cada paciente.
            </p>
          </div>

          {/* Footer */}
          <p className="text-white/20 text-xs">
            Inglaterra N31-187 y Mariana de Jesús · Quito
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[380px]">
          {/* Logo móvil */}
          <div className="flex lg:hidden flex-col items-center mb-10">
            <TreeLogo size={64} />
            <h1 className="mt-3 text-xl font-bold" style={{ color: '#1B5E35' }}>
              Fundación Árbol de Vida
            </h1>
          </div>

          <div className="mb-9">
            <h2 className="text-[2rem] font-bold text-[#0D1F17] tracking-tight">Bienvenida</h2>
            <p className="mt-1.5 text-[#5A7063] text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#2D3C35] mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="doctora@arboldevida.ec"
                className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] placeholder-[#9DB5A4] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D3C35] mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] bg-[#F8FAF9] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-[border-color,box-shadow] text-[#0D1F17] text-sm"
              />
            </div>

            {error && (
              <div className="alert-in p-3.5 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #0C1E14 0%, #1B5E35 55%, #00A896 100%)' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[#9DB5A4]">
            Sistema exclusivo para personal médico autorizado
          </p>
        </div>
      </div>
    </div>
  )
}
