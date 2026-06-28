import type { BinderPageData, BinderSlotData } from '../../api/types'
import { BinderCoverNameEditor } from './BinderCoverNameEditor'
import { BinderPage } from './BinderPage'
import './BinderSpread.css'

type BinderSpreadProps = {
  binderId: number
  binderName: string
  leftPage: BinderPageData | null
  rightPage: BinderPageData | null
  rows: number
  cols: number
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onSlotCleared: (pageId: number, position: number) => void
  onBinderRenamed: (name: string) => void
}

export function BinderSpread({
  binderId,
  binderName,
  leftPage,
  rightPage,
  rows,
  cols,
  onSlotUpdated,
  onSlotCleared,
  onBinderRenamed,
}: BinderSpreadProps) {
  const pageProps = { binderId, rows, cols, onSlotUpdated, onSlotCleared }

  return (
    <div className="binder-spread">
      <div className="binder-spread__left">
        {leftPage ? (
          <BinderPage page={leftPage} {...pageProps} />
        ) : (
          <div className="binder-spread__cover">
            <BinderCoverNameEditor
              binderId={binderId}
              name={binderName}
              onRenamed={onBinderRenamed}
            />
          </div>
        )}
      </div>

      <div className="binder-spread__spine" aria-hidden="true" />

      <div className="binder-spread__right">
        {rightPage ? (
          <BinderPage page={rightPage} {...pageProps} />
        ) : (
          <div className="binder-spread__empty-right" />
        )}
      </div>
    </div>
  )
}
