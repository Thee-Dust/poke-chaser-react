import type { CollectionSummary } from '../../api/types'
import { CollectionTile } from './CollectionTile'
import './CollectionGrid.css'

type CollectionGridProps = {
  collections: CollectionSummary[]
  loading?: boolean
  onNewCollection?: () => void
}

export function CollectionGrid({ collections, loading, onNewCollection }: CollectionGridProps) {
  if (loading) {
    return (
      <div className="collection-grid collection-grid--loading" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="collection-tile collection-tile--skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className="collection-grid">
      {collections.map((collection) => (
        <CollectionTile key={collection.id} collection={collection} />
      ))}
      {onNewCollection && (
        <button className="collection-tile collection-tile--new" onClick={onNewCollection}>
          + New collection
        </button>
      )}
    </div>
  )
}
