import { Link } from 'react-router-dom'
import type { Set } from '../../api/types'
import './SetGrid.css'

type SetTileProps = {
  set: Set
}

function formatDate(date?: string) {
  if (!date) return null

  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  })
}

export function SetTile({ set }: SetTileProps) {
  const formattedDate = formatDate(set.release_date)
  const logo = set.images?.logo
  const cardCount = set.total

  return (
    <Link to={`/sets/${set.id}`} className="set-tile">
      <div className="set-tile__image-wrap">
        {logo ? (
          <img src={logo} alt="" className="set-tile__image" loading="lazy" />
        ) : (
          <div className="set-tile__placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="set-tile__body">
        <h2 className="set-tile__name">{set.name}</h2>
        <p className="set-tile__meta">
          {[formattedDate, cardCount ? `${cardCount} cards` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </Link>
  )
}
