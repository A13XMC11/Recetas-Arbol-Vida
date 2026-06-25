import { useState, useRef, useEffect } from 'react'
import { X, Camera, CheckCircle } from 'lucide-react'
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from '@/types'
import type { InventoryCategory, InventoryUnit } from '@/types'
import { createInventoryItem, createMovement } from '@/lib/api/inventory'

interface AddItemModalProps {
  onCreated: () => void
  onClose: () => void
}

export default function AddItemModal({ onCreated, onClose }: AddItemModalProps) {
  const [form, setForm] = useState({
    name: '',
    category: 'Otros' as InventoryCategory,
    unit: 'unidad' as InventoryUnit,
    min_stock: 5,
    barcode: '',
    initial_stock: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scannerSupported, setScannerSupported] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    setScannerSupported('BarcodeDetector' in window)
    return () => stopScanner()
  }, [])

  function stopScanner() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  async function startScanner() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      })

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes.length > 0) {
            setForm(f => ({ ...f, barcode: barcodes[0].rawValue }))
            setScanSuccess(true)
            stopScanner()
            setTimeout(() => setScanSuccess(false), 2500)
            return
          }
        } catch { /* frame not ready yet */ }
        animFrameRef.current = requestAnimationFrame(scan)
      }

      animFrameRef.current = requestAnimationFrame(scan)
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const result = await createInventoryItem({
        name: form.name,
        category: form.category,
        unit: form.unit,
        min_stock: form.min_stock,
        barcode: form.barcode.trim() || undefined,
      })
      if (result.error) {
        setError(result.error)
        setSaving(false)
        return
      }

      if (form.initial_stock > 0 && result.data) {
        await createMovement({
          item_id: result.data.id,
          type: 'entrada',
          quantity: form.initial_stock,
          notes: 'Stock inicial',
        })
      }

      onCreated()
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo.')
      setSaving(false)
    }
  }

  function handleClose() {
    stopScanner()
    onClose()
  }

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Nuevo producto</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Lidocaína 2%, Jeringas 5ml, Fundas de basura"
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as InventoryCategory }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800 bg-white"
              >
                {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Unidad</label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value as InventoryUnit }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800 bg-white"
              >
                {INVENTORY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Stock mínimo
              </label>
              <input
                type="number"
                value={form.min_stock}
                onChange={e => setForm(f => ({ ...f, min_stock: Math.max(1, parseInt(e.target.value) || 1) }))}
                min={1}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Cantidad actual
              </label>
              <input
                type="number"
                value={form.initial_stock}
                onChange={e => setForm(f => ({ ...f, initial_stock: Math.max(0, parseInt(e.target.value) || 0) }))}
                min={0}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Código de barras (opcional)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.barcode}
                  onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                  placeholder="Escríbelo o escanéalo"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-[background-color,border-color,color,opacity] text-gray-800 placeholder-gray-400 font-mono ${
                    scanSuccess ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'
                  }`}
                />
                {scanSuccess && (
                  <CheckCircle
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                    size={16}
                  />
                )}
              </div>
              {scannerSupported && (
                <button
                  type="button"
                  onClick={scanning ? stopScanner : startScanner}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-[background-color,border-color,color,opacity] flex items-center gap-1.5 shrink-0 ${
                    scanning
                      ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {scanning ? <X size={15} /> : <Camera size={15} />}
                  {scanning ? 'Cancelar' : 'Escanear'}
                </button>
              )}
            </div>

            {scanning && (
              <div className="mt-2 rounded-xl overflow-hidden border border-emerald-200 bg-black relative">
                <video
                  ref={videoRef}
                  className="w-full h-44 object-cover"
                  playsInline
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-16 border-2 border-emerald-400 rounded-lg" />
                </div>
                <p className="absolute bottom-2 left-0 right-0 text-center text-white text-xs">
                  Apunta al código de barras
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-[background-color,border-color,color,opacity]"
              style={{ background: 'linear-gradient(135deg, #1B5E35, #00BFA5)' }}
            >
              {saving ? 'Guardando...' : 'Agregar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
