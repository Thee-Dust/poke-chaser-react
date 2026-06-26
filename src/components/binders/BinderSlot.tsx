import { useState } from 'react'
import type { BinderSlotData, Card } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'

type BinderSlotProps = {
  binderId: number
  pageId: number
  position: number
  card: Card | null
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onSlotCleared: (pageId: number, position: number) => void
}

export function BinderSlot({
  binderId,
  pageId,
  position,
  card,
  onSlotUpdated,
  onSlotCleared,
}: BinderSlotProps) {
  const data = useData()
  const [dragOver, setDragOver] = useState(false)
  const [clearing, setClearing] = useState(false)

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const cardId = e.dataTransfer.getData('card_id')
    if (!cardId) return
    setDragOver(false)
    try {
      const slot = await data.setSlotCard(binderId, pageId, position, cardId)
      onSlotUpdated(pageId, position, slot)
    } catch {
      // no-op: slot stays unchanged on failure
    }
  }

  async function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (clearing) return
    setClearing(true)
    try {
      await data.clearSlotCard(binderId, pageId, position)
      onSlotCleared(pageId, position)
    } finally {
      setClearing(false)
    }
  }

  const className = [
    'binder-slot',
    card ? 'binder-slot--filled' : 'binder-slot--empty',
    dragOver ? 'binder-slot--drag-over' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }}
      onDragEnter={() => setDragOver(true)}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => void handleDrop(e)}
    >
      {card && (
        <>
          <img
            className="binder-slot__img"
            src={card.images?.small}
            alt={card.name}
            loading="lazy"
          />
          <button
            type="button"
            className="binder-slot__remove"
            onClick={(e) => void handleClear(e)}
            disabled={clearing}
            aria-label={`Remove ${card.name}`}
          >
            <svg
              viewBox="0 0 16 16"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 4h12M5.5 4V2.5h5V4M6 7v4.5M10 7v4.5M3 4l.75 9h8.5L13 4" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
