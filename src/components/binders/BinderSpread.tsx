import type { BinderPageData } from '../../api/types'
import { BinderPage } from './BinderPage'
import './BinderSpread.css'

type BinderSpreadProps = {
  binderName: string
  leftPage: BinderPageData | null
  rightPage: BinderPageData | null
  rows: number
  cols: number
}

export function BinderSpread({ binderName, leftPage, rightPage, rows, cols }: BinderSpreadProps) {
  return (
    <div className="binder-spread">
      <div className="binder-spread__left">
        {leftPage ? (
          <BinderPage page={leftPage} rows={rows} cols={cols} />
        ) : (
          <div className="binder-spread__cover">
            <span className="binder-spread__cover-name">{binderName}</span>
          </div>
        )}
      </div>

      <div className="binder-spread__spine" aria-hidden="true" />

      <div className="binder-spread__right">
        {rightPage ? (
          <BinderPage page={rightPage} rows={rows} cols={cols} />
        ) : (
          <div className="binder-spread__empty-right" />
        )}
      </div>
    </div>
  )
}
