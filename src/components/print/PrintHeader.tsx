import TreeLogo from '@/components/logo/TreeLogo'
import type { Profile } from '@/types'

interface PrintHeaderProps {
  profile: Profile | null
}

export default function PrintHeader({ profile }: PrintHeaderProps) {
  return (
    <div style={{ borderBottom: '1.5px solid #1B5E35', paddingBottom: '4px', marginBottom: '5px' }}>
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, #1B5E35, #00BFA5)',
          marginBottom: '5px',
          borderRadius: '1px',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
        <div style={{ flexShrink: 0 }}>
          <TreeLogo size={30} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: '7.5pt', color: '#1B5E35', lineHeight: 1.2, margin: 0 }}>
            Fundación Árbol de Vida
          </p>
          <p style={{ fontSize: '6pt', color: '#555', margin: 0, lineHeight: 1.3 }}>
            Dirección: Inglaterra N31-187 y Mariana de Jesús
          </p>
          <p style={{ fontSize: '6pt', color: '#555', margin: 0, lineHeight: 1.3 }}>
            Teléfono: {profile?.phone || '—'}
          </p>
          <p style={{ fontSize: '7pt', fontWeight: 700, color: '#1B5E35', margin: 0, marginTop: '2px' }}>
            {profile?.full_name || 'Nombre del médico'}
          </p>
          <p style={{ fontSize: '6pt', color: '#555', margin: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {profile?.specialty || 'Especialidad'}
          </p>
        </div>
      </div>
    </div>
  )
}
