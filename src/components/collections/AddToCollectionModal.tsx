import { useEffect, useRef, useState } from 'react'
import type { CollectionSummary } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import './AddToCollectionModal.css'

type AddToCollectionModalProps = {
  cardId: string
  cardName: string
  onClose: () => void
}

type View = 'select' | 'create'

export function AddToCollectionModal({ cardId, cardName, onClose }: AddToCollectionModalProps) {
  const data = useData()

  const [view, setView] = useState<View>('select')
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const newNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCollections() {
      try {
        const list = await data.getCollections()
        if (!cancelled) {
          setCollections(list)
          setNewName(`Collection ${list.length + 1}`)
        }
      } catch {
        if (!cancelled) setError('Failed to load collections.')
      } finally {
        if (!cancelled) setLoadingCollections(false)
      }
    }

    loadCollections()
    return () => { cancelled = true }
  }, [data])

  useEffect(() => {
    if (view === 'create') {
      newNameInputRef.current?.focus()
      newNameInputRef.current?.select()
    }
  }, [view])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  async function handleAdd() {
    if (selectedId === null) return
    setSubmitting(true)
    setError(null)
    try {
      await data.addCardToCollection(selectedId, cardId)
      onClose()
    } catch {
      setError('Failed to add card to collection. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await data.createCollection(trimmed)
      setCollections((prev) => {
        const updated = [...prev, created]
        setNewName(`Collection ${updated.length + 1}`)
        return updated
      })
      setSelectedId(created.id)
      setView('select')
    } catch {
      setError('Failed to create collection. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const title = view === 'select' ? `Add ${cardName} to collection` : 'New collection'

  return (
    <div
      className="add-to-collection-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      <div className="add-to-collection-modal">
        <button
          type="button"
          className="add-to-collection-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="add-to-collection-modal__title">{title}</h2>

        {view === 'select' ? (
          <>
            <div className="add-to-collection-modal__list">
              {loadingCollections ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="add-to-collection-modal__skeleton" />
                ))
              ) : (
                collections.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`add-to-collection-modal__collection-row${selectedId === c.id ? ' add-to-collection-modal__collection-row--selected' : ''}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span>{c.name}</span>
                    <span className="add-to-collection-modal__collection-count">
                      {c.card_count} {c.card_count === 1 ? 'card' : 'cards'}
                    </span>
                  </button>
                ))
              )}
            </div>

            {!loadingCollections && (
              <button
                type="button"
                className="add-to-collection-modal__new-row"
                onClick={() => { setView('create'); setError(null) }}
              >
                + New collection
              </button>
            )}

            {error && <p className="add-to-collection-modal__error">{error}</p>}

            <div className="add-to-collection-modal__actions">
              <button type="button" className="btn" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void handleAdd()}
                disabled={selectedId === null || submitting}
              >
                {submitting ? 'Adding…' : 'Add'}
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className="add-to-collection-modal__back"
              onClick={() => { setView('select'); setError(null) }}
            >
              ← Back to collections
            </button>

            <form className="add-to-collection-modal__form" onSubmit={handleCreate} noValidate>
              <label className="add-to-collection-modal__label">
                <span>Name</span>
                <input
                  ref={newNameInputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoComplete="off"
                  required
                />
              </label>

              {error && <p className="add-to-collection-modal__error">{error}</p>}

              <div className="add-to-collection-modal__actions">
                <button type="button" className="btn" onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting || !newName.trim()}
                >
                  {submitting ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
