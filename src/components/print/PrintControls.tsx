import { useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

interface PrintControlsProps {
  disabled?: boolean
}

export default function PrintControls({ disabled = false }: PrintControlsProps) {
  const navigate = useNavigate()
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    if (isPrinting) return
    setIsPrinting(true)
    setTimeout(() => setIsPrinting(false), 1000)
    window.print()
  }

  return (
    <div
      className="print:hidden flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 shadow-sm gap-3 transition-shadow"
      style={{
        background: 'linear-gradient(135deg, #1B5E35 0%, #00897B 100%)',
      }}
    >
      <button
        onClick={() => navigate('/dashboard')}
        disabled={isPrinting || disabled}
        className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium flex-shrink-0 transition-[color,opacity]"
        style={{
          transitionProperty: 'color, opacity',
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Volver</span>
      </button>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handlePrint}
          disabled={isPrinting || disabled}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-white text-sm font-semibold flex-shrink-0"
          style={{
            color: '#1B5E35',
            transition: 'all 180ms cubic-bezier(0.23, 1, 0.32, 1)',
            opacity: isPrinting || disabled ? 0.6 : 1,
            transform: isPrinting || disabled ? 'scale(0.98)' : 'scale(1)',
          }}
          onMouseDown={(e) => {
            if (!isPrinting && !disabled) {
              e.currentTarget.style.transform = 'scale(0.95)'
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title={disabled ? 'Cargando...' : isPrinting ? 'Imprimiendo...' : 'Abre el diálogo de impresión'}
        >
          <Printer size={15} />
          <span>{disabled ? 'Cargando...' : isPrinting ? 'Imprimiendo...' : 'Imprimir'}</span>
        </button>
      </div>
    </div>
  )
}
