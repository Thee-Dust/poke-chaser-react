import type { Set } from '../../api/types'
import { SetTile } from './SetTile'
import './SetGrid.css'

type SetGridProps = {
  sets: Set[]
  loading?: boolean
}

export function SetGrid({ sets, loading }: SetGridProps) {
  if (loading) {
    return (
      <div className="set-grid set-grid--loading" aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="set-tile set-tile--skeleton" />
        ))}
      </div>
    )
  }

  if (sets.length === 0) {
    return <p className="set-grid__empty">No sets found.</p>
  }

  return (
    <div className="set-grid">
      {sets.map((set) => (
        <SetTile key={set.id} set={set} />
      ))}
    </div>
  )
}
