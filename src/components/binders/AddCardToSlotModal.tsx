import { useEffect, useRef, useState } from 'react'
import type { BinderSlotData, Card } from '../../api/types'
import { Pagination } from '../ui/Pagination'
import { useData } from '../../providers/DataProviderContext'
import './AddCardToSlotModal.css'

type AddCardToSlotModalProps = {
  binderId: number
  pageId: number
  position: number
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onClose: () => void
}

export function AddCardToSlotModal({
  binderId,
  pageId,
  position,
  onSlotUpdated,
  onClose,
}: AddCardToSlotModalProps) {
  const data = useData()
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Card[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const trimmed = query.trim()
    const delay = trimmed ? 400 : 0

    const timer = setTimeout(() => {
      setSearchQuery(trimmed)
    }, delay)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false

    async function loadResults() {
      if (!searchQuery) {
        setResults([])
        setPages(1)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const result = await data.searchCards(searchQuery, page, 'name_asc')
        if (!cancelled) {
          setResults(result.cards)
          setPages(result.pages)
        }
      } catch {
        if (!cancelled) {
          setResults([])
          setPages(1)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadResults()

    return () => {
      cancelled = true
    }
  }, [data, searchQuery, page])

  useEffect(() => {
    resultsRef.current?.scrollTo(0, 0)
  }, [page])

  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

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

  return (
    <div
      className="add-card-slot-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-card-slot-modal-title"
    >
      <div className="add-card-slot-modal">
        <button
          type="button"
          className="add-card-slot-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 id="add-card-slot-modal-title" className="add-card-slot-modal__title">
          Add card to slot
        </h2>

        <input
          ref={inputRef}
          type="search"
          className="add-card-slot-modal__search"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          autoComplete="off"
        />

        <div ref={resultsRef} className="add-card-slot-modal__results">
          {loading && <p className="add-card-slot-modal__status">Searching…</p>}
          {!loading && !searchQuery && (
            <p className="add-card-slot-modal__status">Type a card name to search.</p>
          )}
          {!loading && searchQuery && results.length === 0 && (
            <p className="add-card-slot-modal__status">No results.</p>
          )}
          {!loading && results.length > 0 && (
            <div className="add-card-slot-modal__grid">
              {results.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className="add-card-slot-modal__card"
                  onClick={() => void handleSelect(card)}
                  disabled={assigning !== null}
                  title={card.name}
                >
                  <span className="add-card-slot-modal__card-image-wrap">
                    <img
                      src={card.images?.large ?? card.images?.small ?? ''}
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  <span className="add-card-slot-modal__card-name">{card.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {searchQuery && (
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
