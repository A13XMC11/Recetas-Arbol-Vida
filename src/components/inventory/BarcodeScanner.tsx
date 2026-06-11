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
        setScanning(true)

        const controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current!,
          (result, err) => {
            if (result && !detectedRef.current) {
              detectedRef.current = true
              controlsRef.current?.stop()
              onDetected(result.getText())
            }
            if (err && !(err instanceof NotFoundException)) {
              // Errores de frame sin código — normales en escaneo continuo
            }
          }
        )

        controlsRef.current = controls
      } catch (e) {
        setScanning(false)
        const msg = e instanceof Error ? e.message : String(e)
        if (/permission|denied/i.test(msg)) {
          setError('Permiso de cámara denegado. Actívalo en la configuración de tu navegador.')
        } else {
          setError('No se pudo iniciar la cámara. Verifica que ninguna otra app la esté usando.')
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
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 safe-top">
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

      {/* Área de cámara */}
      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <Camera size={48} className="text-white/30 mb-4" />
            <p className="text-white/80 text-sm leading-relaxed">{error}</p>
          </div>
        ) : (
          <>
            {/* Video sin recorte — muestra el campo de visión completo */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'contain', background: '#000' }}
            />

            {/* Overlay oscuro + ventana de escaneo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Cuatro franjas oscuras alrededor de la ventana */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom,
                    rgba(0,0,0,0.55) 0%,
                    rgba(0,0,0,0.55) calc(50% - 80px),
                    transparent calc(50% - 80px),
                    transparent calc(50% + 80px),
                    rgba(0,0,0,0.55) calc(50% + 80px),
                    rgba(0,0,0,0.55) 100%
                  )`,
                }}
              />

              {/* Marco de escaneo */}
              <div
                className="relative z-10"
                style={{ width: '75%', maxWidth: 300, height: 160 }}
              >
                {/* Esquinas verdes */}
                <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />

                {/* Línea de escaneo */}
                {scanning && (
                  <div
                    className="absolute left-3 right-3 h-0.5 rounded-full bg-emerald-400"
                    style={{
                      animation: 'scanline 2s ease-in-out infinite',
                      boxShadow: '0 0 10px #34d399, 0 0 4px #34d399',
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 flex-shrink-0 text-center safe-bottom">
        {!error && (
          <p className="text-white/60 text-sm">
            Centra el código de barras dentro del recuadro
          </p>
        )}
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 8%;  }
          50%  { top: 82%; }
          100% { top: 8%;  }
        }
      `}</style>
    </div>
  )
}
