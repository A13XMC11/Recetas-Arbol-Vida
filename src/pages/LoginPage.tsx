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
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — gradiente */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(160deg, #1B5E35 0%, #00BFA5 100%)' }}
      >
        <TreeLogo size={120} />
        <h1 className="mt-8 text-4xl font-bold text-white text-center leading-tight">
          Fundación<br />Árbol de Vida
        </h1>
        <p className="mt-4 text-lg text-white/80 text-center max-w-xs">
          Sistema de gestión de recetas médicas
        </p>
        <div className="mt-12 flex flex-col gap-3 text-white/70 text-sm text-center">
          <p>Dirección: Inglaterra N31-187</p>
          <p>y Mariana de Jesús · Quito</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <TreeLogo size={72} />
            <h1 className="mt-3 text-2xl font-bold" style={{ color: '#1B5E35' }}>
              Fundación Árbol de Vida
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Bienvenida</h2>
            <p className="mt-2 text-gray-500">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="doctora@arboldevida.ec"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1B5E35 0%, #00BFA5 100%)' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Sistema exclusivo para personal médico
          </p>
        </div>
      </div>
    </div>
  )
}
