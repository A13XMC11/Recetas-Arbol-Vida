import type { Profile, Prescription } from '@/types'
import LeftHalf from './LeftHalf'
import RightHalf from './RightHalf'

interface PrescriptionPrintProps {
  prescription: Prescription
  profile: Profile | null
}

export default function PrescriptionPrint({ prescription, profile }: PrescriptionPrintProps) {
  return (
    <div
      id="print-content"
      className="prescription-sheet"
      style={{
        width: '210mm',
        height: '148mm',
        display: 'flex',
        flexDirection: 'row',
        background: 'white',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <LeftHalf prescription={prescription} profile={profile} />

      <div
        className="prescription-separator"
        style={{
          width: 0,
          borderLeft: '1px dashed #aaa',
          height: '148mm',
          flexShrink: 0,
        }}
      />

      <RightHalf prescription={prescription} profile={profile} />
    </div>
  )
}
