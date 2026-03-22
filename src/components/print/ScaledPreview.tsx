import { useEffect, useRef, useState } from 'react'

interface ScaledPreviewProps {
  children: React.ReactNode
  naturalWidth: number
  naturalHeight: number
}

export default function ScaledPreview({ children, naturalWidth, naturalHeight }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function recalc() {
      if (!containerRef.current) return
      const available = containerRef.current.clientWidth - 32
      const newScale = Math.min(1, available / naturalWidth)
      setScale(newScale)
    }
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [naturalWidth])

  return (
    <div ref={containerRef} className="w-full flex justify-center px-4">
      <div
        style={{
          width: naturalWidth * scale,
          height: naturalHeight * scale,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: naturalWidth,
            height: naturalHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
