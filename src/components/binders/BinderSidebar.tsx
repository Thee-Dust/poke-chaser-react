import { useEffect, useRef, useState } from 'react'
import type { Card, CollectionSummary } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import './BinderSidebar.css'

function CardThumb({ card }: { card: Card }) {
  const [dragging, setDragging] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('card_id', card.id)
    e.dataTransfer.effectAllowed = 'copy'

    if (imgRef.current) {
      e.dataTransfer.setDragImage(imgRef.current, imgRef.current.width / 2, imgRef.current.height / 2)
    }

    setDragging(true)
  }

  function handleDragEnd() {
    setDragging(false)
  }

  return (
    <div
      className={`binder-sidebar__thumb${dragging ? ' binder-sidebar__thumb--dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={card.name}
    >
      <img ref={imgRef} src={card.images?.small ?? ''} alt={card.name} loading="lazy" />
    </div>
  )
}

function CollectionSection() {
  const data = useData()
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [loadingCards, setLoadingCards] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingCollections(true)
      try {
        const list = await data.getCollections()
        if (!cancelled) {
          setCollections(list)
          if (list.length > 0) setSelectedId(list[0].id)
        }
      } finally {
        if (!cancelled) setLoadingCollections(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [data])

  useEffect(() => {
    if (selectedId == null) return
    let cancelled = false
    async function load() {
      setLoadingCards(true)
      setCards([])
      try {
        const detail = await data.getCollection(selectedId!)
        if (!cancelled && detail) {
          setCards(detail.items.map((item) => item.card))
        }
      } finally {
        if (!cancelled) setLoadingCards(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [data, selectedId])

  return (
    <div className="binder-sidebar__section">
      <p className="binder-sidebar__section-title">My Collection</p>

      {loadingCollections ? (
        <p className="binder-sidebar__loading">Loading…</p>
      ) : collections.length === 0 ? (
        <p className="binder-sidebar__empty">No collections yet.</p>
      ) : (
        <select
          className="binder-sidebar__select"
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {loadingCards ? (
        <p className="binder-sidebar__loading">Loading cards…</p>
      ) : cards.length > 0 ? (
        <div className="binder-sidebar__thumbs">
          {cards.map((card) => (
            <CardThumb key={card.id} card={card} />
          ))}
        </div>
      ) : selectedId != null && !loadingCollections ? (
        <p className="binder-sidebar__empty">No cards in this collection.</p>
      ) : null}
    </div>
  )
}

function SearchSection() {
  const data = useData()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="binder-sidebar__section">
      <p className="binder-sidebar__section-title">Search Cards</p>
      <input
        type="search"
        className="binder-sidebar__search-input"
        placeholder="Card name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      {loading && <p className="binder-sidebar__loading">Searching…</p>}
      {!loading && results.length > 0 && (
        <div className="binder-sidebar__thumbs">
          {results.map((card) => (
            <CardThumb key={card.id} card={card} />
          ))}
        </div>
      )}
      {!loading && query.trim() && results.length === 0 && (
        <p className="binder-sidebar__empty">No results.</p>
      )}
    </div>
  )
}

type BinderSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

export function BinderSidebar({ isOpen, onClose }: BinderSidebarProps) {
  const className = [
    'binder-sidebar',
    isOpen ? 'binder-sidebar--open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {isOpen && (
        <div
          className="binder-sidebar__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={className}>
        {onClose && (
          <div className="binder-sidebar__mobile-header">
            <span className="binder-sidebar__mobile-title">Cards</span>
            <button
              type="button"
              className="binder-sidebar__mobile-close"
              onClick={onClose}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>
        )}
        <CollectionSection />
        <SearchSection />
      </aside>
    </>
  )
}
