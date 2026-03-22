import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, BookTemplate, Settings, LogOut, Stethoscope, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import TreeLogo from '@/components/logo/TreeLogo'
import InactivityGuard from '@/components/auth/InactivityGuard'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', icon: FileText, label: 'Nueva Receta' },
  { href: '/templates', icon: BookTemplate, label: 'Plantillas' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
]

interface AppShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export default function AppShell({ profile, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  const initials = profile?.full_name
    ? profile.full_name.replace(/^Dra?\.\s*/i, '').charAt(0).toUpperCase()
    : null

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function NavContent({ onNav }: { onNav?: () => void }) {
    return (
      <>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <TreeLogo size={36} />
          <div>
            <p className="text-white font-bold text-sm leading-tight">Fundación</p>
            <p className="text-white font-bold text-sm leading-tight">Árbol de Vida</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                to={href}
                onClick={onNav}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Perfil + logout */}
        <div className="px-4 pb-5 border-t border-white/10 pt-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-white/20 text-white">
              {initials ?? <Stethoscope size={15} />}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {profile?.full_name || 'Configurar perfil'}
              </p>
              <p className="text-white/60 text-xs truncate">
                {profile?.specialty || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/10"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen flex-shrink-0"
        style={{ background: 'linear-gradient(180deg, #1B5E35 0%, #00897B 60%, #00BFA5 100%)' }}
      >
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 shadow-md"
        style={{ background: 'linear-gradient(135deg, #1B5E35, #00897B)' }}
      >
        <div className="flex items-center gap-3">
          <TreeLogo size={28} />
          <span className="text-white font-bold text-sm">Árbol de Vida</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside
            className="relative flex flex-col w-72 min-h-screen z-10"
            style={{ background: 'linear-gradient(180deg, #1B5E35 0%, #00897B 60%, #00BFA5 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
