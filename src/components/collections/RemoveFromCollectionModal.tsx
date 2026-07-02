import { useEffect, useState } from 'react'
import type { CollectionItem } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import './RemoveFromCollectionModal.css'

type RemoveFromCollectionModalProps = {
  collectionId: number
  item: CollectionItem
  collectionName: string
  onClose: () => void
  onRemoved: () => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function getPurchasesToRemove(quantity: number, removeQty: number, purchaseCount: number): number {
  if (removeQty === quantity) return 0
  const newQuantity = quantity - removeQty
  return Math.max(0, purchaseCount - newQuantity)
}

function getConfirmMessage(
  cardName: string,
  collectionName: string,
  quantity: number,
  removeQty: number,
  purchasesToRemove: number,
): string {
  if (quantity === 1) {
    return `Remove ${cardName} from ${collectionName}? This cannot be undone.`
  }
  if (removeQty === quantity) {
    return `Remove all ${quantity} copies of ${cardName} from ${collectionName}? This will also delete any purchase history.`
  }
  const copyLabel = removeQty === 1 ? '1 copy' : `${removeQty} copies`
  if (purchasesToRemove > 0) {
    const recordLabel = purchasesToRemove === 1 ? 'purchase record' : 'purchase records'
    return `Remove ${copyLabel} of ${cardName} from ${collectionName}? Selected ${recordLabel} will also be deleted.`
  }
  return `Remove ${copyLabel} of ${cardName} from ${collectionName}?`
}

export function RemoveFromCollectionModal({
  collectionId,
  item,
  collectionName,
  onClose,
  onRemoved,
}: RemoveFromCollectionModalProps) {
  const data = useData()
  const quantity = item.quantity ?? 1
  const purchaseCount = item.purchases.length

  const [removeQty, setRemoveQty] = useState(1)
  const [selectedPurchaseIds, setSelectedPurchaseIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardName = item.card.name
  const purchasesToRemove = getPurchasesToRemove(quantity, removeQty, purchaseCount)
  const selectionComplete = purchasesToRemove === 0 || selectedPurchaseIds.length === purchasesToRemove

  useEffect(() => {
    setSelectedPurchaseIds([])
  }, [removeQty])

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

  function setRemoveQuantity(next: number) {
    setRemoveQty(Math.max(1, Math.min(quantity, next)))
  }

  function togglePurchase(purchaseId: number) {
    setSelectedPurchaseIds((prev) => {
      if (prev.includes(purchaseId)) {
        return prev.filter((id) => id !== purchaseId)
      }
      if (prev.length >= purchasesToRemove) {
        return prev
      }
      return [...prev, purchaseId]
    })
  }

  async function handleRemove() {
    setSubmitting(true)
    setError(null)
    try {
      if (removeQty === quantity) {
        await data.deleteCollectionItem(collectionId, item.id)
      } else {
        for (const purchaseId of selectedPurchaseIds) {
          await data.deletePurchase(collectionId, item.id, purchaseId)
        }
        await data.updateCollectionItemQuantity(collectionId, item.id, quantity - removeQty)
      }
      onRemoved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove card. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmMessage = getConfirmMessage(
    cardName,
    collectionName,
    quantity,
    removeQty,
    purchasesToRemove,
  )

  return (
    <div
      className="remove-from-collection-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label={`Remove ${cardName} from collection`}
    >
      <div className="remove-from-collection-modal">
        <button
          type="button"
          className="remove-from-collection-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="remove-from-collection-modal__title">Remove from collection</h2>

        {quantity > 1 && (
          <div className="remove-from-collection-modal__quantity">
            <span className="remove-from-collection-modal__quantity-text" id="remove-quantity-label">
              Quantity to remove
            </span>
            <div
              className="remove-from-collection-modal__quantity-stepper"
              role="group"
              aria-labelledby="remove-quantity-label"
            >
              <button
                type="button"
                className="remove-from-collection-modal__quantity-btn"
                onClick={() => setRemoveQuantity(removeQty - 1)}
                disabled={removeQty <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                id="remove-quantity"
                className="remove-from-collection-modal__quantity-input"
                type="number"
                min={1}
                max={quantity}
                value={removeQty}
                aria-labelledby="remove-quantity-label"
                onChange={(e) => setRemoveQuantity(Number(e.target.value))}
              />
              <button
                type="button"
                className="remove-from-collection-modal__quantity-btn remove-from-collection-modal__quantity-btn--plus"
                onClick={() => setRemoveQuantity(removeQty + 1)}
                disabled={removeQty >= quantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}

        {purchasesToRemove > 0 && (
          <div className="remove-from-collection-modal__purchases">
            <h3 className="remove-from-collection-modal__purchases-heading">
              Select purchase history to remove
            </h3>
            <p className="remove-from-collection-modal__helper">
              Removing {removeQty === 1 ? '1 copy' : `${removeQty} copies`} requires deleting{' '}
              {purchasesToRemove} purchase {purchasesToRemove === 1 ? 'record' : 'records'}.
            </p>
            <ul className="remove-from-collection-modal__purchase-list">
              {item.purchases.map((purchase) => {
                const checked = selectedPurchaseIds.includes(purchase.id)
                const atLimit = !checked && selectedPurchaseIds.length >= purchasesToRemove
                return (
                  <li key={purchase.id}>
                    <label
                      className={`remove-from-collection-modal__purchase-row${checked ? ' remove-from-collection-modal__purchase-row--selected' : ''}${atLimit ? ' remove-from-collection-modal__purchase-row--disabled' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={atLimit}
                        onChange={() => togglePurchase(purchase.id)}
                      />
                      <span className="remove-from-collection-modal__purchase-date">
                        {formatDate(purchase.acquired_date)}
                      </span>
                      <span className="remove-from-collection-modal__purchase-price">
                        ${Number(purchase.purchase_price).toFixed(2)}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <p className="remove-from-collection-modal__message">{confirmMessage}</p>

        {error && <p className="remove-from-collection-modal__error">{error}</p>}

        <div className="remove-from-collection-modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="remove-from-collection-modal__confirm-btn"
            onClick={() => void handleRemove()}
            disabled={submitting || !selectionComplete}
          >
            {submitting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}
