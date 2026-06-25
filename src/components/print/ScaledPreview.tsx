import { useEffect, useRef, useState } from 'react'

interface ScaledPreviewProps {
  children: React.ReactNode
  naturalWidth: number
  naturalHeight: number
}

export default function ScaledPreview({ children, naturalWidth, naturalHeight }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)

  useEffect(() => {
    function recalc(entry?: ResizeObserverEntry) {
      const width = entry
        ? entry.contentRect.width
        : containerRef.current?.clientWidth ?? 0
      const available = width - 32
      setScale(Math.min(1, available / naturalWidth))
    }

    const observer = new ResizeObserver(([entry]) => recalc(entry))
    if (containerRef.current) {
      observer.observe(containerRef.current)
      recalc()
    }

    return () => observer.disconnect()
  }, [naturalWidth])

  return (
    <div ref={containerRef} className="w-full flex justify-center px-4">
      {scale !== null && (
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
      )}
    </div>
  )
}
