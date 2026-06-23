import { useEffect, useState } from 'react'
import './DeleteCollectionModal.css'

type DeleteCollectionModalProps = {
  collectionName: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function DeleteCollectionModal({
  collectionName,
  onConfirm,
  onClose,
}: DeleteCollectionModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete collection. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="delete-collection-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label="Delete collection"
    >
      <div className="delete-collection-modal">
        <button
          type="button"
          className="delete-collection-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="delete-collection-modal__title">Delete collection?</h2>
        <p className="delete-collection-modal__message">
          This will permanently delete &ldquo;{collectionName}&rdquo; and all cards in it. This cannot be undone.
        </p>

        {error && <p className="delete-collection-modal__error">{error}</p>}

        <div className="delete-collection-modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="delete-collection-modal__confirm-btn"
            onClick={() => void handleConfirm()}
            disabled={submitting}
          >
            {submitting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
