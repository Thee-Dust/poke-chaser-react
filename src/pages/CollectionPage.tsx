import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { CollectionDetail, CollectionSummary } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { useData } from '../providers/DataProviderContext'

export function CollectionPage() {
  const { collectionId } = useParams<{ collectionId?: string }>()
  const navigate = useNavigate()
  const data = useData()

  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [detail, setDetail] = useState<CollectionDetail | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoadingList(true)
    data.getCollections().then((list) => {
      if (cancelled) return
      setCollections(list)
      setLoadingList(false)
    }).catch(() => {
      if (!cancelled) setLoadingList(false)
    })
    return () => { cancelled = true }
  }, [data])

  const activeId = collectionId ? Number(collectionId) : null

  useEffect(() => {
    if (activeId === null || isNaN(activeId)) return
    let cancelled = false
    setLoadingDetail(true)
    setDetail(null)
    data.getCollection(activeId).then((d) => {
      if (cancelled) return
      setDetail(d ?? null)
      setLoadingDetail(false)
    }).catch(() => {
      if (!cancelled) setLoadingDetail(false)
    })
    return () => { cancelled = true }
  }, [data, activeId])

  if (!loadingList && !collectionId && collections.length > 0) {
    const defaultCollection =
      collections.find((c) => c.is_default) ?? collections[0]
    return <Navigate to={`/collection/${defaultCollection.id}`} replace />
  }

  const activeCollection = collections.find((c) => c.id === activeId)
  const cards = detail?.items.map((item) => item.card) ?? []

  return (
    <div className="page">
      <div className="page__header">
        <h1>{activeCollection?.name ?? 'My Collection'}</h1>

        {collections.length > 1 && (
          <div className="page__sort">
            <label className="page__sort-label" htmlFor="collection-switcher">
              Collection
            </label>
            <select
              id="collection-switcher"
              className="page__sort-select"
              value={activeId ?? ''}
              onChange={(e) => navigate(`/collection/${e.target.value}`)}
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.is_default ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeCollection && (
        <div className="collection__stats">
          <span className="collection__stat">
            {activeCollection.card_count} {activeCollection.card_count === 1 ? 'card' : 'cards'}
          </span>
          {activeCollection.total_market_value > 0 && (
            <span className="collection__stat">
              ${activeCollection.total_market_value.toFixed(2)} market value
            </span>
          )}
        </div>
      )}

      {!loadingList && collections.length === 0 && (
        <p className="page__message">No collections found.</p>
      )}

      <CardGrid cards={cards} loading={loadingList || loadingDetail} showSetName />
    </div>
  )
}
