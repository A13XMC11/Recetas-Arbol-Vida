import { useNavigate } from 'react-router-dom'
import { Printer, FileDown, ArrowLeft } from 'lucide-react'

export default function PrintControls() {
  const navigate = useNavigate()

  return (
    <div
      className="print:hidden flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 shadow-sm gap-3"
      style={{ background: 'linear-gradient(135deg, #1B5E35 0%, #00897B 100%)' }}
    >
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors flex-shrink-0"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Volver</span>
      </button>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-all"
          title="Abre el diálogo de impresión. Selecciona 'Guardar como PDF' para obtener el archivo."
        >
          <FileDown size={15} />
          <span className="hidden sm:inline">Guardar PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-white text-sm font-semibold transition-all hover:bg-emerald-50 active:scale-95"
          style={{ color: '#1B5E35' }}
        >
          <Printer size={15} />
          Imprimir
        </button>
      </div>
    </div>
  )
}
