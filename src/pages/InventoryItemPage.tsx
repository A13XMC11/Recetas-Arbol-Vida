import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Trash2, ScanLine } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AppShell from '@/components/layout/AppShell'
import StockBadge from '@/components/inventory/StockBadge'
import MovementModal from '@/components/inventory/MovementModal'
import MovementHistory from '@/components/inventory/MovementHistory'
import { getInventoryItem, getMovementsForItem, deleteInventoryItem } from '@/lib/api/inventory'
import { getProfile } from '@/lib/api/profiles'
import type { Profile, InventoryItemWithStock, InventoryMovement } from '@/types'

export default function InventoryItemPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [item, setItem] = useState<InventoryItemWithStock | null>(null)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada')
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    const [prof, itm, movs] = await Promise.all([
      getProfile(),
      getInventoryItem(id),
      getMovementsForItem(id),
    ])
    setProfile(prof)
    if (!itm) {
      navigate('/inventory', { replace: true })
      return
    }
    setItem(itm)
    setMovements(movs)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, loadData])

  async function handleDelete() {
    if (!id || !item) return
    const confirmed = window.confirm(`¿Eliminar "${item.name}"?\nSe perderá todo su historial de movimientos.`)
    if (!confirmed) return
    setDeleting(true)
    const result = await deleteInventoryItem(id)
    if (result.error) {
      alert('Error al eliminar: ' + result.error)
      setDeleting(false)
      return
    }
    navigate('/inventory', { replace: true })
  }

  function openMovement(type: 'entrada' | 'salida') {
    setMovementType(type)
    setShowMovementModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f7f4' }}>
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!item) return null

  return (
    <AppShell profile={profile}>
      <div className="min-h-screen" style={{ background: '#f0f7f4' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Botón volver */}
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-5"
          >
            <ArrowLeft size={16} />
            Volver al inventario
          </button>

          {/* Card del producto */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {item.category} · mínimo {item.min_stock} {item.unit}
                </p>
              </div>
              <StockBadge current={item.current_stock} minimum={item.min_stock} unit={item.unit} />
            </div>

            <div className="flex flex-wrap gap-3 mt-2 mb-1">
              {item.last_restock && (
                <p className="text-xs text-gray-400">
                  Último ingreso:{' '}
                  {new Date(item.last_restock).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              {item.barcode && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <ScanLine size={12} />
                  <span className="font-mono">{item.barcode}</span>
                </p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={() => openMovement('entrada')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
              >
                <ArrowDownCircle size={16} />
                Entrada
              </button>
              <button
                onClick={() => openMovement('salida')}
                disabled={item.current_stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #b91c1c, #ef4444)' }}
              >
                <ArrowUpCircle size={16} />
                Salida
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                title="Eliminar producto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Historial */}
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Historial de movimientos
            {movements.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({movements.length})
              </span>
            )}
          </h2>
          <MovementHistory movements={movements} unit={item.unit} />

        </div>
      </div>

      {showMovementModal && (
        <MovementModal
          item={item}
          defaultType={movementType}
          onCreated={() => { setShowMovementModal(false); loadData() }}
          onClose={() => setShowMovementModal(false)}
        />
      )}
    </AppShell>
  )
}
