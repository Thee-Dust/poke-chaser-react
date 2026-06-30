import type { BinderSummary } from '../../api/types'
import { BinderTile } from './BinderTile'
import './BinderGrid.css'

type BinderGridProps = {
  binders: BinderSummary[]
  loading?: boolean
  onNewBinder?: () => void
  onDelete?: (binder: BinderSummary) => void
}

export function BinderGrid({ binders, loading, onNewBinder, onDelete }: BinderGridProps) {
  if (loading) {
    return (
      <div className="binder-grid binder-grid--loading" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="binder-tile binder-tile--skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className="binder-grid">
      {binders.map((binder) => (
        <BinderTile key={binder.id} binder={binder} onDelete={onDelete} />
      ))}
      {onNewBinder && (
        <button className="binder-tile binder-tile--new" onClick={onNewBinder}>
          + New binder
        </button>
      )}
    </div>
  )
}
