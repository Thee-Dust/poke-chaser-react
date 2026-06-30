import { Link } from 'react-router-dom'
import type { BinderSummary } from '../../api/types'
import './BinderGrid.css'

type BinderTileProps = {
  binder: BinderSummary
  onDelete?: (binder: BinderSummary) => void
}

export function BinderTile({ binder, onDelete }: BinderTileProps) {
  return (
    <div className="binder-tile">
      <Link
        to={`/binders/${binder.id}`}
        className="binder-tile__link"
        aria-label={`Open ${binder.name}`}
      />
      <div className="binder-tile__content">
        <div className="binder-tile__header">
          <div className="binder-tile__name-row">
            <span className="binder-tile__name">{binder.name}</span>
            {onDelete && (
              <button
                type="button"
                className="binder-tile__delete-btn"
                aria-label="Delete binder"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(binder)
                }}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4h12M5.5 4V2.5h5V4M6 7v4.5M10 7v4.5M3 4l.75 9h8.5L13 4" />
                </svg>
              </button>
            )}
          </div>
          <span className="binder-tile__size">{binder.rows}×{binder.cols}</span>
        </div>
        <span className="binder-tile__meta">
          {binder.page_count} {binder.page_count === 1 ? 'page' : 'pages'} · {binder.capacity} cards per page
        </span>
      </div>
    </div>
  )
}
