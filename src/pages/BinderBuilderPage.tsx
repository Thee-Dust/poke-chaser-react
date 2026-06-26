import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import type { BinderDetail, BinderPageData } from '../api/types'
import { BinderSidebar } from '../components/binders/BinderSidebar'
import { BinderSpread } from '../components/binders/BinderSpread'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { useData } from '../providers/DataProviderContext'
import './BinderBuilderPage.css'

function getTotalSpreads(pages: BinderPageData[]): number {
  if (pages.length === 0) return 1
  return 1 + Math.ceil((pages.length - 1) / 2)
}

function getSpreadPages(
  spread: number,
  pages: BinderPageData[],
): { left: BinderPageData | null; right: BinderPageData | null } {
  if (spread === 0) {
    return { left: null, right: pages[0] ?? null }
  }
  return {
    left: pages[2 * spread - 1] ?? null,
    right: pages[2 * spread] ?? null,
  }
}

function getSpreadLabel(spread: number, pages: BinderPageData[]): string {
  if (spread === 0) {
    return pages.length > 0 ? 'Cover / Page 1' : 'Cover'
  }
  const leftNum = 2 * spread
  const rightNum = 2 * spread + 1
  return rightNum <= pages.length ? `Page ${leftNum} / Page ${rightNum}` : `Page ${leftNum}`
}

export function BinderBuilderPage() {
  const { binderId } = useParams<{ binderId: string }>()
  const data = useData()

  const [binder, setBinder] = useState<BinderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSpread, setCurrentSpread] = useState(0)
  const [addingPage, setAddingPage] = useState(false)

  const activeId = Number(binderId)
  const invalidId = !binderId || isNaN(activeId)

  useEffect(() => {
    if (invalidId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await data.getBinder(activeId)
        if (!cancelled) setBinder(result ?? null)
      } catch {
        if (!cancelled) setError('Failed to load binder.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [data, activeId, invalidId])

  async function handleAddPage() {
    if (!binder || addingPage) return
    setAddingPage(true)
    try {
      const newPage = await data.addBinderPage(binder.id)
      const updatedPages = [...binder.pages, newPage]
      setBinder({ ...binder, pages: updatedPages, page_count: updatedPages.length })
      setCurrentSpread(getTotalSpreads(updatedPages) - 1)
    } finally {
      setAddingPage(false)
    }
  }

  if (invalidId) return <Navigate to="/binders" replace />

  if (loading) {
    return (
      <div className="binder-builder">
        <p className="binder-builder__loading">Loading binder…</p>
      </div>
    )
  }

  if (error || !binder) {
    return (
      <div className="page">
        <Breadcrumb items={[{ label: 'Binders', to: '/binders' }, { label: 'Not found' }]} />
        <p className="binder-builder__error">{error ?? 'Binder not found.'}</p>
      </div>
    )
  }

  const spreads = getTotalSpreads(binder.pages)
  const clampedSpread = Math.min(currentSpread, spreads - 1)
  const { left, right } = getSpreadPages(clampedSpread, binder.pages)

  return (
    <div className="binder-builder">
      <div className="binder-builder__header">
        <Breadcrumb items={[{ label: 'Binders', to: '/binders' }, { label: binder.name }]} />
        <div className="binder-builder__title-row">
          <h1 className="binder-builder__title">{binder.name}</h1>
          <div className="binder-builder__nav">
            <button
              type="button"
              className="btn binder-builder__nav-btn"
              onClick={() => setCurrentSpread((s) => Math.max(0, s - 1))}
              disabled={clampedSpread === 0}
              aria-label="Previous spread"
            >
              ‹
            </button>
            <label className="binder-builder__jump-label">
              <span className="binder-builder__jump-sr">Jump to</span>
              <select
                className="binder-builder__jump-select"
                value={clampedSpread}
                onChange={(e) => setCurrentSpread(Number(e.target.value))}
              >
                {Array.from({ length: spreads }).map((_, i) => (
                  <option key={i} value={i}>
                    {getSpreadLabel(i, binder.pages)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn binder-builder__nav-btn"
              onClick={() => setCurrentSpread((s) => Math.min(spreads - 1, s + 1))}
              disabled={clampedSpread >= spreads - 1}
              aria-label="Next spread"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="binder-builder__workspace">
        <div className="binder-builder__spread-wrap">
          <BinderSpread
            binderName={binder.name}
            leftPage={left}
            rightPage={right}
            rows={binder.rows}
            cols={binder.cols}
          />
          <button
            type="button"
            className="binder-builder__add-page"
            onClick={() => void handleAddPage()}
            disabled={addingPage}
            aria-label="Add page"
            title="Add page"
          >
            +
          </button>
        </div>
        <BinderSidebar />
      </div>
    </div>
  )
}
