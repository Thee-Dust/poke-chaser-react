import { useLayoutEffect, useRef, useState } from 'react'
import './BinderSpreadScaler.css'

type BinderSpreadScalerProps = {
  children: React.ReactNode
  maxHeight?: string
}

type ContentSize = {
  width: number
  height: number
}

export function BinderSpreadScaler({ children, maxHeight = '75svh' }: BinderSpreadScalerProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [contentSize, setContentSize] = useState<ContentSize>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    function updateScale() {
      const maxH = viewport!.clientHeight
      const contentH = content!.scrollHeight
      const contentW = content!.scrollWidth

      if (maxH === 0 || contentH === 0 || contentW === 0) return

      setScale(Math.min(1, maxH / contentH))
      setContentSize({ width: contentW, height: contentH })
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(viewport)
    observer.observe(content)
    window.addEventListener('resize', updateScale)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [children])

  const scaledHeight = contentSize.height * scale
  const scaledWidth = contentSize.width * scale
  const isFitted = contentSize.height > 0 && contentSize.width > 0

  return (
    <div
      ref={viewportRef}
      className={`binder-spread-scaler${isFitted ? ' binder-spread-scaler--fitted' : ''}`}
      style={{
        maxHeight,
        height: isFitted ? scaledHeight : undefined,
        width: isFitted ? scaledWidth : undefined,
      }}
    >
      <div
        ref={contentRef}
        className="binder-spread-scaler__inner"
        style={{
          transform: `scale(${scale})`,
          width: contentSize.width || undefined,
          height: contentSize.height || undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
