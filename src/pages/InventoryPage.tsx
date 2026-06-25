import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowDownCircle, ArrowUpCircle, Package, ChevronRight, ScanLine } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AppShell from '@/components/layout/AppShell'
import StockBadge from '@/components/inventory/StockBadge'
import AddItemModal from '@/components/inventory/AddItemModal'
import MovementModal from '@/components/inventory/MovementModal'
import LowStockSummary from '@/components/inventory/LowStockSummary'
import BarcodeScanner from '@/components/inventory/BarcodeScanner'
import QuickMovementModal from '@/components/inventory/QuickMovementModal'
import AssignBarcodeModal from '@/components/inventory/AssignBarcodeModal'
import { getInventoryWithStock, getInventoryItemByBarcode } from '@/lib/api/inventory'
import { getProfile } from '@/lib/api/profiles'
import type { Profile, InventoryItemWithStock } from '@/types'
import { INVENTORY_CATEGORIES } from '@/types'

type ScanState =
  | { phase: 'idle' }
  | { phase: 'scanning' }
  | { phase: 'found'; item: InventoryItemWithStock }
  | { phase: 'not_found'; barcode: string }

export default function InventoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [items, setItems] = useState<InventoryItemWithStock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [movementTarget, setMovementTarget] = useState<{ item: InventoryItemWithStock; type: 'entrada' | 'salida' } | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [scanState, setScanState] = useState<ScanState>({ phase: 'idle' })

  const loadData = useCallback(async () => {
    try {
      const [prof, inv] = await Promise.all([getProfile(), getInventoryWithStock()])
      setProfile(prof)
      setItems(inv)
    } catch {
      // error de red — dejamos los datos actuales y cerramos el spinner
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user?.id, loadData])

  async function handleBarcodeDetected(barcode: string) {
    setScanState({ phase: 'idle' }) // cierra la cámara primero
    const item = await getInventoryItemByBarcode(barcode)
    if (item) {
      setScanState({ phase: 'found', item })
    } else {
      setScanState({ phase: 'not_found', barcode })
    }
  }

  const categories = ['Todos', ...INVENTORY_CATEGORIES]
  const filtered = activeCategory === 'Todos'
    ? items
    : items.filter(i => i.category === activeCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F7F4' }}>
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppShell profile={profile}>
      <div className="min-h-screen" style={{ background: '#F2F7F4' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0D1F17] tracking-tight">Inventario</h1>
              <p className="text-[#5A7063] text-sm mt-1">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setScanState({ phase: 'scanning' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-[background-color,border-color,color]"
                style={{ borderColor: '#00BFA5', color: '#00897B' }}
                title="Escanear código de barras"
              >
                <ScanLine size={16} />
                <span className="hidden sm:inline">Escanear</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            </div>
          </div>

          {/* Banner escanear — visible en móvil como acceso rápido */}
          <button
            onClick={() => setScanState({ phase: 'scanning' })}
            className="sm:hidden w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed mb-5 transition-colors active:scale-95"
            style={{ borderColor: '#00BFA5', color: '#00897B', background: '#f0fdfa' }}
          >
            <ScanLine size={22} />
            <span className="font-semibold text-sm">Escanear código de barras</span>
          </button>

          {/* Alertas stock bajo */}
          <LowStockSummary items={items} />

          {/* Filtro categoría */}
          {items.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-[background-color,border-color,color] cursor-pointer ${
                    activeCategory === cat
                      ? 'text-white shadow-sm'
                      : 'bg-white text-[#5A7063] border border-[#DCE8DF] hover:border-[#1B5E35]/30 hover:text-[#1B5E35]'
                  }`}
                  style={activeCategory === cat ? { background: '#1B5E35' } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Lista */}
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DCE8DF] shadow-sm py-16 flex flex-col items-center gap-3">
              <Package size={40} className="text-[#C5D9CA]" />
              <p className="text-[#5A7063] text-sm font-medium">Sin productos aún</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-sm font-semibold cursor-pointer"
                style={{ color: '#1B5E35' }}
              >
                Agregar el primer producto
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#DCE8DF] shadow-sm overflow-hidden">
              {filtered.length === 0 ? (
                <p className="text-center py-10 text-[#5A7063] text-sm">Sin productos en esta categoría.</p>
              ) : (
                <div className="divide-y divide-[#F0F5F1]">
                  {filtered.map((item, index) => (
                    <div
                      key={item.id}
                      className="fade-up flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAF9] transition-colors"
                      style={{ animationDelay: `${Math.min(index * 35, 180)}ms` }}
                    >
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/inventory/${item.id}`)}
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-[#0D1F17] truncate">{item.name}</p>
                          <ChevronRight size={13} className="text-[#C5D9CA] flex-shrink-0" />
                        </div>
                        <p className="text-xs text-[#5A7063] mt-0.5">{item.category}</p>
                      </div>
                      <StockBadge current={item.current_stock} minimum={item.min_stock} unit={item.unit} />
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => setMovementTarget({ item, type: 'entrada' })}
                          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Entrada"
                        >
                          <ArrowDownCircle size={18} />
                        </button>
                        <button
                          onClick={() => setMovementTarget({ item, type: 'salida' })}
                          disabled={item.current_stock === 0}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Salida"
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

      {/* Modales */}
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

      {scanState.phase === 'scanning' && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setScanState({ phase: 'idle' })}
        />
      )}

      {scanState.phase === 'found' && (
        <QuickMovementModal
          item={scanState.item}
          onDone={() => { setScanState({ phase: 'idle' }); loadData() }}
          onClose={() => setScanState({ phase: 'idle' })}
        />
      )}

      {scanState.phase === 'not_found' && (
        <AssignBarcodeModal
          barcode={scanState.barcode}
          items={items}
          onAssigned={() => { setScanState({ phase: 'idle' }); loadData() }}
          onClose={() => setScanState({ phase: 'idle' })}
        />
      )}
    </AppShell>
  )
}
