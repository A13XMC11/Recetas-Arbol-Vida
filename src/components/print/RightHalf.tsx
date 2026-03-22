import type { Profile, Prescription } from '@/types'
import PrintHeader from './PrintHeader'

interface MedicationData {
  name: string
  instructions: string
}

interface RightHalfProps {
  prescription: Prescription
  profile: Profile | null
}

export default function RightHalf({ prescription, profile }: RightHalfProps) {
  const meds = prescription.medications as MedicationData[]
  const medsWithInstructions = meds.filter(m => m.instructions)

  return (
    <div
      className="prescription-half"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PrintHeader profile={profile} />

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '10pt', fontWeight: 900, color: '#1B5E35', margin: 0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Indicaciones:
        </p>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '5px 6px',
            minHeight: '55mm',
            background: '#fafffe',
          }}
        >
          {medsWithInstructions.map((med, i) => (
            <p key={i} style={{ fontSize: '7pt', color: '#333', margin: 0, marginBottom: '3px', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700, color: '#1B5E35' }}>{med.name}:</span>{' '}{med.instructions}
            </p>
          ))}
          {prescription.instructions ? (
            <p style={{ fontSize: '7pt', color: '#333', margin: 0, marginTop: medsWithInstructions.length > 0 ? '4px' : 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              — {prescription.instructions}
            </p>
          ) : medsWithInstructions.length === 0 ? (
            <p style={{ fontSize: '7pt', color: '#aaa', margin: 0 }}>—</p>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: '6px' }}>
        <p style={{ fontSize: '7.5pt', fontWeight: 700, color: '#333', margin: 0 }}>
          <span style={{ color: '#1B5E35' }}>PRÓXIMA CITA:</span>{' '}
          {prescription.next_appointment || '—'}
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '6px', textAlign: 'right' }}>
        <p style={{ fontSize: '5.5pt', color: '#bbb', margin: 0, fontStyle: 'italic' }}>
          Corte por la línea punteada
        </p>
      </div>
    </div>
  )
}
