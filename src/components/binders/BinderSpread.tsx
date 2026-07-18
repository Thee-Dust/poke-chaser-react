import type { BinderPageData, BinderSlotData } from '../../api/types'
import { BinderCoverNameEditor } from './BinderCoverNameEditor'
import { BinderPage } from './BinderPage'
import type { BinderSlotMoveHandler } from './BinderSlot'
import './BinderSpread.css'

type BinderSpreadProps = {
  binderId: number
  binderName: string
  leftPage: BinderPageData | null
  rightPage: BinderPageData | null
  rows: number
  cols: number
  layout?: 'spread' | 'single'
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onSlotCleared: (pageId: number, position: number) => void
  onSlotMoved: BinderSlotMoveHandler
  onBinderRenamed: (name: string) => void
}

export function BinderSpread({
  binderId,
  binderName,
  leftPage,
  rightPage,
  rows,
  cols,
  layout = 'spread',
  onSlotUpdated,
  onSlotCleared,
  onSlotMoved,
  onBinderRenamed,
}: BinderSpreadProps) {
  const pageProps = { binderId, rows, cols, onSlotUpdated, onSlotCleared, onSlotMoved }

  if (layout === 'single') {
    return (
      <div className="binder-spread binder-spread--single">
        <div className="binder-spread__panel">
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
      </div>
    )
  }

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
