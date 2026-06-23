import { useEffect, useRef, useState } from 'react'
import type { CollectionSummary } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import './CreateCollectionModal.css'

type CreateCollectionModalProps = {
  defaultName: string
  onCreated: (collection: CollectionSummary) => void
  onClose: () => void
}

export function CreateCollectionModal({ defaultName, onCreated, onClose }: CreateCollectionModalProps) {
  const data = useData()
  const [name, setName] = useState(defaultName)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    try {
      const collection = await data.createCollection(trimmed)
      onCreated(collection)
    } catch {
      setError('Failed to create collection. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="create-collection-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label="New collection"
    >
      <div className="create-collection-modal">
        <button
          type="button"
          className="create-collection-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="create-collection-modal__title">New collection</h2>

        <form className="create-collection-modal__form" onSubmit={handleSubmit} noValidate>
          <label className="create-collection-modal__label">
            <span>Name</span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
            />
          </label>

          {error && <p className="create-collection-modal__error">{error}</p>}

          <div className="create-collection-modal__actions">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
