import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import type { IScannerControls } from '@zxing/browser'
import { X, Camera } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const detectedRef = useRef(false)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    detectedRef.current = false

    async function startScan() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (devices.length === 0) {
          setError('No se encontró cámara en este dispositivo.')
          return
        }

        // Preferir cámara trasera
        const back = devices.find(d =>
          /back|rear|environment/i.test(d.label)
        ) ?? devices[devices.length - 1]

        setScanning(true)

        const controls = await reader.decodeFromVideoDevice(
          back.deviceId,
          videoRef.current!,
          (result, err) => {
            if (result && !detectedRef.current) {
              detectedRef.current = true
              controls?.stop()
              onDetected(result.getText())
            }
            if (err && !(err instanceof NotFoundException)) {
              // Errores esperados durante el escaneo continuo — ignorar
            }
          }
        )

        controlsRef.current = controls
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (/permission/i.test(msg)) {
          setError('Permiso de cámara denegado. Actívalo en la configuración de tu navegador.')
        } else {
          setError('No se pudo iniciar la cámara. Intenta recargar la página.')
        }
      }
    }

    startScan()

    return () => {
      controlsRef.current?.stop()
    }
  }, [onDetected])

  function handleClose() {
    controlsRef.current?.stop()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Camera size={20} />
          <span className="font-semibold text-sm">Escanear código</span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Cámara */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="px-8 text-center">
            <Camera size={48} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/80 text-sm leading-relaxed">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />

            {/* Overlay con marco de escaneo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-black/50" />

              <div
                className="relative z-10 border-2 border-white/80 rounded-lg"
                style={{ width: '80%', maxWidth: 320, height: 140 }}
              >
                {/* Esquinas */}
                <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <span className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Línea de escaneo animada */}
                {scanning && (
                  <div
                    className="absolute left-2 right-2 h-0.5 bg-emerald-400 rounded-full"
                    style={{
                      animation: 'scanline 2s ease-in-out infinite',
                      boxShadow: '0 0 8px #34d399',
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 flex-shrink-0 text-center">
        {!error && (
          <p className="text-white/60 text-sm">
            Apunta la cámara al código de barras del producto
          </p>
        )}
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 10%; }
          50%  { top: 80%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  )
}
