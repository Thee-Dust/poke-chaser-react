import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Card, CollectionDetail, CollectionItem } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { DeleteCollectionModal } from '../components/collections/DeleteCollectionModal'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { useData } from '../providers/DataProviderContext'
import './CollectionPage.css'

const CARD_SORT_OPTIONS = [
  { value: 'number_asc', label: 'Default' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'name_asc', label: 'A–Z' },
  { value: 'name_desc', label: 'Z–A' },
] as const

type SortValue = typeof CARD_SORT_OPTIONS[number]['value']

function sortItems(items: CollectionItem[], sort: SortValue): CollectionItem[] {
  return [...items].sort((a, b) => {
    const ac = a.card
    const bc = b.card
    switch (sort) {
      case 'name_asc': return (ac.name ?? '').localeCompare(bc.name ?? '')
      case 'name_desc': return (bc.name ?? '').localeCompare(ac.name ?? '')
      case 'price_desc':
      case 'price_asc': {
        const priceOf = (item: CollectionItem) => {
          const v = item.market_value
          if (v != null) return Number(v)
          const prices = item.card.tcgplayer?.prices
          if (!prices) return -1
          const markets = Object.values(prices)
            .map((p) => p?.market)
            .filter((m): m is number => typeof m === 'number')
          return markets.length ? Math.max(...markets) : -1
        }
        return sort === 'price_desc'
          ? priceOf(b) - priceOf(a)
          : priceOf(a) - priceOf(b)
      }
      case 'number_asc':
      default: {
        const num = (c: Card) => {
          const n = parseInt(c.number ?? '', 10)
          return isNaN(n) ? Infinity : n
        }
        return num(ac) - num(bc)
      }
    }
  })
}

export function CollectionPage() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const data = useData()

  const [detail, setDetail] = useState<CollectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sort, setSort] = useState<SortValue>('number_asc')

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
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
        const d = await data.getCollection(activeId)
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
  }, [data, activeId, invalidId])

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

  const sortedItems = sortItems(detail?.items ?? [], sort)
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
    <div className="page">
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

      {detail && (
        <div className="page__header">
          <span />
          <label className="page__sort">
            <span className="page__sort-label">Sort</span>
            <select
              className="page__sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
            >
              {CARD_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <CardGrid items={sortedItems} loading={loading} showSetName />

      {deleteModalOpen && detail && (
        <DeleteCollectionModal
          collectionName={detail.name}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  )
}
