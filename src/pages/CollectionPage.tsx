import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { CollectionDetail, CollectionItem } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { DeleteCollectionModal } from '../components/collections/DeleteCollectionModal'
import { PurchaseHistoryModal } from '../components/collections/PurchaseHistoryModal'
import { RemoveFromCollectionModal } from '../components/collections/RemoveFromCollectionModal'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { CARD_SORT_OPTIONS, SortSelect } from '../components/ui/SortSelect'
import { useData } from '../providers/DataProviderContext'
import './CollectionPage.css'

type SortValue = typeof CARD_SORT_OPTIONS[number]['value']

export function CollectionPage() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const data = useData()

  const [detail, setDetail] = useState<CollectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)

  const [sort, setSort] = useState<SortValue>('price_desc')

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [historyItem, setHistoryItem] = useState<CollectionItem | null>(null)
  const [removeItem, setRemoveItem] = useState<CollectionItem | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeId = Number(collectionId)
  const invalidId = !collectionId || isNaN(activeId)

  useEffect(() => {
    if (invalidId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setDetail(null)

      try {
        const d = await data.getCollection(activeId, sort)
        if (!cancelled) {
          setDetail(d ?? null)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load collection. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [data, activeId, invalidId, sort, refresh])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEditing() {
    setEditName(detail?.name ?? '')
    setSaveError(null)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setSaveError(null)
  }

  async function handleSave() {
    const trimmed = editName.trim()
    if (!trimmed || !detail) return

    setSaving(true)
    setSaveError(null)

    try {
      await data.updateCollection(detail.id, trimmed)
      setDetail((prev) => prev ? { ...prev, name: trimmed } : prev)
      setEditing(false)
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void handleSave()
    if (e.key === 'Escape') cancelEditing()
  }

  async function handleDeleteConfirm() {
    if (!detail) return
    await data.deleteCollection(detail.id)
    navigate('/collections')
  }

  if (invalidId) {
    return <Navigate to="/collections" replace />
  }

  const sortedItems = detail?.items ?? []
  const marketValue = detail ? Number(detail.total_market_value) : 0
  const purchasedMarketValue = detail ? Number(detail.purchased_market_value) : 0
  const totalSpent = detail ? Number(detail.total_spent) : 0
  const gainLoss = detail ? Number(detail.gain_loss) : 0
  const gainLossClass =
    gainLoss > 0
      ? 'collection-detail__gain-loss--positive'
      : gainLoss < 0
        ? 'collection-detail__gain-loss--negative'
        : ''

  return (
    <div className="page page--wide">
      <Breadcrumb
        items={[
          { label: 'Collections', to: '/collections' },
          { label: detail?.name ?? 'Collection' },
        ]}
      />

      <div className="page__header">
        {editing ? (
          <div className="collection-detail__rename">
            <input
              ref={inputRef}
              className="collection-detail__rename-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Collection name"
              disabled={saving}
            />
            <button
              className="btn btn--primary"
              onClick={() => void handleSave()}
              disabled={saving || !editName.trim()}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              className="btn"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </button>
            {saveError && <span className="collection-detail__save-error">{saveError}</span>}
          </div>
        ) : (
          <>
            <div className="collection-detail__title">
              <h1>{detail?.name ?? 'Collection'}</h1>
              {detail && (
                <button
                  className="collection-detail__edit-btn"
                  onClick={startEditing}
                  aria-label="Edit collection name"
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.5 2.5a2.121 2.121 0 1 1 3 3L5 15H1v-4L11.5 2.5Z" />
                  </svg>
                </button>
              )}
            </div>
            {detail && !detail.is_default && (
              <button
                type="button"
                className="collection-detail__delete-btn"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>

      <div className="page__inner">
        {error && <p className="page__error">{error}</p>}

        {detail && (
          <div className="collection-detail__market-value">
            <span className="collection-detail__market-value-label">Market Value</span>
            <span className="collection-detail__market-value-amount">${marketValue.toFixed(2)}</span>
          </div>
        )}

        {detail && (
          <div className="collection-detail__summary">
            <div className="collection-detail__summary-stat">
              <span className="collection-detail__summary-label">Cards</span>
              <span className="collection-detail__summary-value">{detail.card_count}</span>
            </div>
            <div className="collection-detail__summary-stat">
              <span className="collection-detail__summary-label">Purchased Market Value</span>
              <span className="collection-detail__summary-value">${purchasedMarketValue.toFixed(2)}</span>
            </div>
            <div className="collection-detail__summary-stat">
              <span className="collection-detail__summary-label">Total Spent</span>
              <span className="collection-detail__summary-value">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="collection-detail__summary-stat">
              <span className="collection-detail__summary-label">Gain / Loss</span>
              <span className={`collection-detail__summary-value collection-detail__gain-loss ${gainLossClass}`}>
                {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {!loading && !detail && !error && (
          <p className="page__message">Collection not found.</p>
        )}

        {!loading && detail && sortedItems.length === 0 ? (
          <div className="collection-detail__empty">
            <p className="collection-detail__empty-title">No cards in this collection yet</p>
            <p className="collection-detail__empty-text">
              Search for cards and add them with the + button on any card.
            </p>
          </div>
        ) : null}
      </div>

      {detail && sortedItems.length > 0 && (
        <div className="page__header page__header--above-list">
          <span />
          <SortSelect
            options={CARD_SORT_OPTIONS}
            value={sort}
            onChange={(value) => setSort(value as SortValue)}
          />
        </div>
      )}

      {(!detail || loading || sortedItems.length > 0) && (
        <CardGrid
          items={sortedItems}
          loading={loading}
          showSetName
          collectionId={detail?.id}
          collectionName={detail?.name}
          onHistory={setHistoryItem}
          onRemove={setRemoveItem}
        />
      )}

      {deleteModalOpen && detail && (
        <DeleteCollectionModal
          collectionName={detail.name}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}

      {historyItem && detail && (
        <PurchaseHistoryModal
          collectionId={detail.id}
          itemId={historyItem.id}
          cardName={historyItem.card.name}
          purchases={historyItem.purchases}
          quantity={historyItem.quantity ?? 1}
          marketPrice={historyItem.market_price ?? null}
          onClose={() => setHistoryItem(null)}
          onMutated={() => {
            setHistoryItem(null)
            setRefresh((n) => n + 1)
          }}
        />
      )}

      {removeItem && detail && (
        <RemoveFromCollectionModal
          collectionId={detail.id}
          item={removeItem}
          collectionName={detail.name}
          onClose={() => setRemoveItem(null)}
          onRemoved={() => {
            setRemoveItem(null)
            setRefresh((n) => n + 1)
          }}
        />
      )}
    </div>
  )
}
