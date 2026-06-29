import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BinderSlotData, Card } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'

const SLOT_DRAG_DATA_TYPE = 'application/x-poke-chaser-binder-slot'

export type BinderSlotLocation = {
  pageId: number
  position: number
}

export type BinderSlotMoveHandler = (source: BinderSlotLocation, target: BinderSlotLocation) => void

// ---- Slot popover (portal) ----

type PopoverProps = {
  binderId: number
  pageId: number
  position: number
  pos: { top: number; left: number }
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onClose: () => void
}

function SlotPopover({ binderId, pageId, position, pos, onSlotUpdated, onClose }: PopoverProps) {
  const data = useData()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function handleMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [onClose])

  useEffect(() => {
    const trimmed = query.trim()
    const delay = trimmed ? 400 : 0

    const timer = setTimeout(async () => {
      if (!trimmed) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const result = await data.searchCards(trimmed)
        setResults(result.cards)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [data, query])

  async function handleSelect(card: Card) {
    if (assigning) return
    setAssigning(card.id)
    try {
      const slot = await data.setSlotCard(binderId, pageId, position, card.id)
      onSlotUpdated(pageId, position, slot)
      onClose()
    } finally {
      setAssigning(null)
    }
  }

  return createPortal(
    <div
      ref={panelRef}
      className="binder-slot-popover"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="binder-slot-popover__header">
        <span className="binder-slot-popover__title">Add card</span>
        <button
          type="button"
          className="binder-slot-popover__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <input
        ref={inputRef}
        type="search"
        className="binder-slot-popover__input"
        placeholder="Search by name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      <div className="binder-slot-popover__results">
        {loading && <p className="binder-slot-popover__status">Searching…</p>}
        {!loading && !query.trim() && (
          <p className="binder-slot-popover__status">Type a card name to search.</p>
        )}
        {!loading && query.trim() && results.length === 0 && (
          <p className="binder-slot-popover__status">No results.</p>
        )}
        {!loading && results.length > 0 && (
          <div className="binder-slot-popover__grid">
            {results.map((card) => (
              <button
                key={card.id}
                type="button"
                className="binder-slot-popover__card"
                onClick={() => void handleSelect(card)}
                disabled={assigning !== null}
                title={card.name}
              >
                <img src={card.images?.small ?? ''} alt={card.name} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

// ---- BinderSlot ----

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
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })

  function handleAddClick() {
    if (!slotRef.current) return
    const rect = slotRef.current.getBoundingClientRect()
    const popoverWidth = 210
    const popoverHeight = 340

    let top = rect.bottom + 6
    if (top + popoverHeight > window.innerHeight - 8) {
      top = rect.top - popoverHeight - 6
    }
    let left = rect.left
    if (left + popoverWidth > window.innerWidth - 8) {
      left = window.innerWidth - popoverWidth - 8
    }

    setPopoverPos({ top: Math.max(8, top), left: Math.max(8, left) })
    setPopoverOpen(true)
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    setPopoverOpen(false)

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

      {popoverOpen && (
        <SlotPopover
          binderId={binderId}
          pageId={pageId}
          position={position}
          pos={popoverPos}
          onSlotUpdated={onSlotUpdated}
          onClose={() => setPopoverOpen(false)}
        />
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
