import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { BinderSlotData, Card } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import { AddCardToSlotModal } from './AddCardToSlotModal'

const SLOT_DRAG_DATA_TYPE = 'application/x-poke-chaser-binder-slot'

export type BinderSlotLocation = {
  pageId: number
  position: number
}

export type BinderSlotMoveHandler = (source: BinderSlotLocation, target: BinderSlotLocation) => void

type BinderSlotProps = {
  binderId: number
  pageId: number
  position: number
  card: Card | null
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onSlotCleared: (pageId: number, position: number) => void
  onSlotMoved: BinderSlotMoveHandler
}

export function BinderSlot({
  binderId,
  pageId,
  position,
  card,
  onSlotUpdated,
  onSlotCleared,
  onSlotMoved,
}: BinderSlotProps) {
  const data = useData()
  const slotRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  function handleAddClick() {
    setModalOpen(true)
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    setModalOpen(false)

    const slotSource = getSlotDragSource(e.dataTransfer)
    if (slotSource) {
      onSlotMoved(slotSource, { pageId, position })
      return
    }

    const cardId = e.dataTransfer.getData('card_id')
    if (!cardId) return

    try {
      const slot = await data.setSlotCard(binderId, pageId, position, cardId)
      onSlotUpdated(pageId, position, slot)
    } catch {
      // slot stays unchanged on failure
    }
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    if (!card) {
      e.preventDefault()
      return
    }

    e.dataTransfer.setData(SLOT_DRAG_DATA_TYPE, JSON.stringify({ pageId, position }))
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }

  function handleDragEnd() {
    setDragging(false)
    setDragOver(false)
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
    dragging ? 'binder-slot--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={slotRef}
      className={className}
      draggable={Boolean(card)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = e.dataTransfer.types.includes(SLOT_DRAG_DATA_TYPE) ? 'move' : 'copy'
      }}
      onDragEnter={() => setDragOver(true)}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => void handleDrop(e)}
    >
      {card ? (
        <>
          <img
            className="binder-slot__img"
            src={card.images?.small}
            alt={card.name}
            loading="lazy"
          />
          <Link
            to={`/cards/${card.id}`}
            className="binder-slot__view"
            aria-label={`View ${card.name}`}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
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
              <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
              <circle cx="8" cy="8" r="2" />
            </svg>
          </Link>
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
      ) : (
        <button
          type="button"
          className="binder-slot__add"
          onClick={handleAddClick}
          aria-label="Add card to slot"
        >
          +
        </button>
      )}

      {modalOpen &&
        createPortal(
          <AddCardToSlotModal
            binderId={binderId}
            pageId={pageId}
            position={position}
            onSlotUpdated={onSlotUpdated}
            onClose={() => setModalOpen(false)}
          />,
          document.body,
        )}
    </div>
  )
}

function getSlotDragSource(dataTransfer: DataTransfer): BinderSlotLocation | null {
  const raw = dataTransfer.getData(SLOT_DRAG_DATA_TYPE)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<BinderSlotLocation>
    if (typeof parsed.pageId !== 'number' || typeof parsed.position !== 'number') return null
    return { pageId: parsed.pageId, position: parsed.position }
  } catch {
    return null
  }
}
