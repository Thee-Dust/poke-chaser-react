import { useEffect, useState } from 'react'
import type { CollectionPurchase } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import './PurchaseHistoryModal.css'

type PurchaseHistoryModalProps = {
  collectionId: number
  itemId: number
  cardName: string
  purchases: CollectionPurchase[]
  quantity: number
  marketPrice?: string | null
  onClose: () => void
  onMutated: () => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function PurchaseHistoryModal({
  collectionId,
  itemId,
  cardName,
  purchases,
  quantity,
  marketPrice,
  onClose,
  onMutated,
}: PurchaseHistoryModalProps) {
  const data = useData()

  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(today())
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const atLimit = purchases.length >= quantity

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

  function openForm() {
    setDate(today())
    setPrice('')
    setError(null)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setError(null)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmedPrice = price.trim()
    if (!trimmedPrice || !date) return

    setSubmitting(true)
    setError(null)
    try {
      await data.addPurchase(collectionId, itemId, trimmedPrice, date)
      setShowForm(false)
      onMutated()
    } catch {
      setError('Failed to add purchase. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(purchaseId: number) {
    setDeletingId(purchaseId)
    setError(null)
    try {
      await data.deletePurchase(collectionId, itemId, purchaseId)
      onMutated()
    } catch {
      setError('Failed to delete purchase. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      className="purchase-history-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label={`Purchase history for ${cardName}`}
    >
      <div className="purchase-history-modal">
        <button
          type="button"
          className="purchase-history-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="purchase-history-modal__title">
          Purchase history
          <span className="purchase-history-modal__card-name"> — {cardName}</span>
        </h2>
        {marketPrice != null && (
          <p className="purchase-history-modal__market-price">
            Current value: <strong>${Number(marketPrice).toFixed(2)}</strong>
          </p>
        )}

        <div className="purchase-history-modal__list">
          {purchases.length === 0 && !showForm && (
            <p className="purchase-history-modal__empty">No purchases logged yet.</p>
          )}
          {purchases.map((p) => (
            <div key={p.id} className="purchase-history-modal__row">
              <span className="purchase-history-modal__row-date">{formatDate(p.acquired_date)}</span>
              <span className="purchase-history-modal__row-price">${Number(p.purchase_price).toFixed(2)}</span>
              <button
                type="button"
                className="purchase-history-modal__delete-btn"
                aria-label="Delete purchase"
                disabled={deletingId === p.id}
                onClick={() => handleDelete(p.id)}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 4h12M5.5 4V2.5h5V4M6 7v4.5M10 7v4.5M3 4l.75 9h8.5L13 4" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {error && <p className="purchase-history-modal__error">{error}</p>}

        {showForm ? (
          <form className="purchase-history-modal__form" onSubmit={handleAdd} noValidate>
            <div className="purchase-history-modal__form-fields">
              <label className="purchase-history-modal__label">
                <span>Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
              <label className="purchase-history-modal__label">
                <span>Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={submitting}
                  autoFocus
                />
              </label>
            </div>
            <div className="purchase-history-modal__actions">
              <button type="button" className="btn" onClick={cancelForm} disabled={submitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={submitting || !price.trim() || !date}
              >
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : atLimit ? (
          <p className="purchase-history-modal__limit">
            All purchases logged ({purchases.length}/{quantity})
          </p>
        ) : (
          <button
            type="button"
            className="purchase-history-modal__add-row"
            onClick={openForm}
          >
            + Add purchase
          </button>
        )}
      </div>
    </div>
  )
}
