import type { Profile, Prescription } from '@/types'
import { formatSpanishDate } from '@/lib/utils/dateUtils'
import PrintHeader from './PrintHeader'

interface LeftHalfProps {
  prescription: Prescription
  profile: Profile | null
}

export default function LeftHalf({ prescription, profile }: LeftHalfProps) {
  const { day, month, year } = formatSpanishDate(prescription.date)
  const meds = prescription.medications as {
    name: string
    presentation: string
    quantity: string
    posology: string
    instructions: string
  }[]

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

      <div style={{ marginBottom: '5px' }}>
        <p style={{ fontSize: '6.5pt', color: '#333', margin: 0 }}>
          Quito, día{' '}
          <span style={{ fontWeight: 700 }}>{day}</span>
          {' '}de{' '}
          <span style={{ fontWeight: 700 }}>{month}</span>
          {' '}de{' '}
          <span style={{ fontWeight: 700 }}>{year}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '3px' }}>
          <p style={{ fontSize: '6.5pt', color: '#333', margin: 0, flexShrink: 0 }}>Paciente:</p>
          <div style={{ flex: 1, borderBottom: '1px solid #aaa' }}>
            <p style={{ fontSize: '7pt', fontWeight: 600, color: '#111', margin: 0, paddingLeft: '2px' }}>
              {prescription.patient_name}
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '11pt', fontWeight: 900, color: '#1B5E35', margin: 0, marginBottom: '4px' }}>
          Rp.
        </p>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '5px 6px',
            minHeight: '50mm',
            background: '#fafffe',
          }}
        >
          {meds.map((med, i) => (
            <div key={i} style={{ marginBottom: i < meds.length - 1 ? '6px' : 0 }}>
              <p style={{ fontSize: '7.5pt', fontWeight: 700, color: '#1B5E35', margin: 0, lineHeight: 1.3 }}>
                {i + 1}. {med.name}
              </p>
              {med.presentation && (
                <p style={{ fontSize: '6.5pt', color: '#444', margin: 0, paddingLeft: '10px', lineHeight: 1.3 }}>
                  {med.presentation}
                </p>
              )}
              {med.posology && (
                <p style={{ fontSize: '6.5pt', color: '#333', margin: 0, paddingLeft: '10px', lineHeight: 1.3 }}>
                  {med.posology}
                </p>
              )}
              {med.quantity && (
                <p style={{ fontSize: '6.5pt', color: '#666', margin: 0, paddingLeft: '10px', lineHeight: 1.3 }}>
                  Cantidad: {med.quantity}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid #eee' }}>
        <div style={{ borderBottom: '1px solid #333', width: '70%', marginBottom: '2px' }} />
        <p style={{ fontSize: '6.5pt', fontWeight: 700, color: '#1B5E35', margin: 0 }}>
          {profile?.full_name || ''}
        </p>
        <p style={{ fontSize: '6pt', color: '#666', margin: 0 }}>
          {profile?.specialty || ''}
        </p>
      </div>
    </div>
  )
}
