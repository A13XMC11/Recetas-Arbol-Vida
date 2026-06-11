import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowDownCircle, ArrowUpCircle, Package, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AppShell from '@/components/layout/AppShell'
import StockBadge from '@/components/inventory/StockBadge'
import AddItemModal from '@/components/inventory/AddItemModal'
import MovementModal from '@/components/inventory/MovementModal'
import LowStockSummary from '@/components/inventory/LowStockSummary'
import { getInventoryWithStock } from '@/lib/api/inventory'
import { getProfile } from '@/lib/api/profiles'
import type { Profile, InventoryItemWithStock } from '@/types'
import { INVENTORY_CATEGORIES } from '@/types'

export default function InventoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [items, setItems] = useState<InventoryItemWithStock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [movementTarget, setMovementTarget] = useState<{ item: InventoryItemWithStock; type: 'entrada' | 'salida' } | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Todos')

  const loadData = useCallback(async () => {
    const [prof, inv] = await Promise.all([getProfile(), getInventoryWithStock()])
    setProfile(prof)
    setItems(inv)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, loadData])

  const categories = ['Todos', ...INVENTORY_CATEGORIES]
  const filtered = activeCategory === 'Todos'
    ? items
    : items.filter(i => i.category === activeCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f7f4' }}>
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppShell profile={profile}>
      <div className="min-h-screen" style={{ background: '#f0f7f4' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventario</h1>
              <p className="text-gray-500 text-sm mt-1">
                {items.length} {items.length === 1 ? 'producto registrado' : 'productos registrados'}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

          {/* Alertas de stock bajo */}
          <LowStockSummary items={items} />

          {/* Filtro por categoría */}
          {items.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? 'text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={activeCategory === cat ? { background: '#1B5E35' } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Lista de productos */}
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
              <Package size={40} className="text-gray-200" />
              <p className="text-gray-400 text-sm font-medium">Sin productos aún</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-sm font-semibold transition-colors"
                style={{ color: '#1B5E35' }}
              >
                Agregar el primer producto
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filtered.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-sm">
                  Sin productos en esta categoría.
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Info — clickeable para ir al historial */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/inventory/${item.id}`)}
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                      </div>

                      {/* Badge de stock */}
                      <StockBadge
                        current={item.current_stock}
                        minimum={item.min_stock}
                        unit={item.unit}
                      />

                      {/* Botones rápidos entrada/salida */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => setMovementTarget({ item, type: 'entrada' })}
                          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Registrar entrada"
                        >
                          <ArrowDownCircle size={18} />
                        </button>
                        <button
                          onClick={() => setMovementTarget({ item, type: 'salida' })}
                          disabled={item.current_stock === 0}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Registrar salida"
                        >
                          <ArrowUpCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddItemModal
          onCreated={() => { setShowAddModal(false); loadData() }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {movementTarget && (
        <MovementModal
          item={movementTarget.item}
          defaultType={movementTarget.type}
          onCreated={() => { setMovementTarget(null); loadData() }}
          onClose={() => setMovementTarget(null)}
        />
      )}
    </AppShell>
  )
}
