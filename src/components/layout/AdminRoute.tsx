import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function AdminRoute() {
  const { user, loading, role } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f7f4' }}>
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
