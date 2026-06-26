import type { BinderPageData } from '../../api/types'
import { BinderSlot } from './BinderSlot'

type BinderPageProps = {
  page: BinderPageData
  rows: number
  cols: number
}

export function BinderPage({ page, cols }: BinderPageProps) {
  return (
    <div
      className="binder-page"
      style={{ '--binder-cols': cols } as React.CSSProperties}
    >
      {Array.from({ length: page.capacity }).map((_, pos) => {
        const slot = page.slots.find((s) => s.position === pos) ?? null
        return (
          <BinderSlot key={pos} position={pos} card={slot?.card ?? null} />
        )
      })}
    </div>
  )
}
