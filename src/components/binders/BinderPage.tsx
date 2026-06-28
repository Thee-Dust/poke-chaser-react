import type { BinderPageData, BinderSlotData } from '../../api/types'
import { BinderSlot } from './BinderSlot'

type BinderPageProps = {
  binderId: number
  page: BinderPageData
  rows: number
  cols: number
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onSlotCleared: (pageId: number, position: number) => void
}

export function BinderPage({
  binderId,
  page,
  cols,
  onSlotUpdated,
  onSlotCleared,
}: BinderPageProps) {
  return (
    <div className="binder-page-wrap">
      <div
        className="binder-page"
        style={{ '--binder-cols': cols } as React.CSSProperties}
      >
        {Array.from({ length: page.capacity }).map((_, pos) => {
          const slot = page.slots.find((s) => s.position === pos) ?? null
          return (
            <BinderSlot
              key={pos}
              binderId={binderId}
              pageId={page.id}
              position={pos}
              card={slot?.card ?? null}
              onSlotUpdated={onSlotUpdated}
              onSlotCleared={onSlotCleared}
            />
          )
        })}
      </div>
    </div>
  )
}
