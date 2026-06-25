import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileText, BookTemplate, Settings, LogOut, Stethoscope, Menu, X, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getLowStockCount } from '@/lib/api/inventory'
import TreeLogo from '@/components/logo/TreeLogo'
import InactivityGuard from '@/components/auth/InactivityGuard'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils/cn'

const DOCTOR_NAV = [
  { href: '/dashboard', icon: FileText, label: 'Nueva Receta' },
  { href: '/templates', icon: BookTemplate, label: 'Plantillas' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
]

const ADMIN_EXTRA = { href: '/inventory', icon: Package, label: 'Inventario' }

interface AppShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export default function AppShell({ profile, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const { role } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  useEffect(() => {
    if (role !== 'admin') return
    getLowStockCount().then(setLowStockCount)
  }, [role, pathname])

  const navItems = role === 'admin'
    ? [...DOCTOR_NAV, ADMIN_EXTRA]
    : DOCTOR_NAV

  const initials = profile?.full_name
    ? profile.full_name.replace(/^Dra?\.\s*/i, '').charAt(0).toUpperCase()
    : null

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error al cerrar sesión:', error)
        alert('Error al cerrar sesión. Por favor intenta de nuevo.')
        setLogoutLoading(false)
        return
      }
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Error inesperado al cerrar sesión:', err)
      alert('Error al cerrar sesión.')
      setLogoutLoading(false)
    }
  }

  function NavContent({ onNav }: { onNav?: () => void }) {
    return (
      <>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.07]">
          <TreeLogo size={34} />
          <div>
            <p className="text-white/90 font-semibold text-sm leading-tight tracking-tight">Fundación</p>
            <p className="text-white/90 font-semibold text-sm leading-tight tracking-tight">Árbol de Vida</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            const isInventory = href === '/inventory'
            return (
              <Link
                key={href}
                to={href}
                onClick={onNav}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-[background-color,color] duration-150 cursor-pointer',
                  active
                    ? 'bg-emerald-500/[0.13] text-emerald-300 font-semibold'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 2} />
                <span className="flex-1">{label}</span>
                {isInventory && lowStockCount > 0 && !active && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold leading-none">
                    {lowStockCount > 9 ? '9+' : lowStockCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Perfil + logout */}
        <div className="px-3 pb-5 border-t border-white/[0.07] pt-4">
          <div className="flex items-start gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
              {initials ?? <Stethoscope size={14} />}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-sm font-semibold truncate leading-tight">
                {profile?.full_name || 'Configurar perfil'}
              </p>
              <p className="text-white/30 text-xs truncate mt-0.5">
                {profile?.specialty || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center gap-2 text-white/30 hover:text-white/70 text-xs transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <LogOut size={13} />
            {logoutLoading ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen flex-shrink-0 bg-[#0C1E14]">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0C1E14] shadow-sm">
        <div className="flex items-center gap-2.5">
          <TreeLogo size={26} />
          <span className="text-white/90 font-semibold text-sm tracking-tight">Árbol de Vida</span>
        </div>
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && role === 'admin' && (
            <Link
              to="/inventory"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold"
            >
              {lowStockCount > 9 ? '9+' : lowStockCount}
            </Link>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="modal-overlay lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="drawer-slide relative flex flex-col w-72 min-h-screen z-10 bg-[#0C1E14]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <NavContent onNav={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:overflow-auto pt-14 lg:pt-0">
        {children}
      </main>

      <InactivityGuard />
    </div>
  )
}
