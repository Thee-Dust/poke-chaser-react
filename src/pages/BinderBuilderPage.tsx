import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import type { BinderDetail, BinderPageData, BinderSlotData } from '../api/types'
import { BinderPageNameEditor } from '../components/binders/BinderPageNameEditor'
import { getPageDisplayName } from '../components/binders/binderPageLabels'
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
  const { left, right } = getSpreadPages(spread, pages)

  if (spread === 0) {
    if (!right) return 'Cover'
    return `Cover / ${getPageDisplayName(right, pages)}`
  }

  if (left && right) {
    return `${getPageDisplayName(left, pages)} / ${getPageDisplayName(right, pages)}`
  }
  if (left) return getPageDisplayName(left, pages)
  return 'Cover'
}

export function BinderBuilderPage() {
  const { binderId } = useParams<{ binderId: string }>()
  const data = useData()

  // Data
  const [binder, setBinder] = useState<BinderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation
  const [currentSpread, setCurrentSpread] = useState(0)
  const [addingPage, setAddingPage] = useState(false)

  // Sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // ---- Slot handlers ----

  function handleSlotUpdated(pageId: number, position: number, slot: BinderSlotData) {
    setBinder((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        pages: prev.pages.map((p) => {
          if (p.id !== pageId) return p
          const filtered = p.slots.filter((s) => s.position !== position)
          return { ...p, slots: [...filtered, slot] }
        }),
      }
    })
  }

  function handleSlotCleared(pageId: number, position: number) {
    setBinder((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        pages: prev.pages.map((p) => {
          if (p.id !== pageId) return p
          return { ...p, slots: p.slots.filter((s) => s.position !== position) }
        }),
      }
    })
  }

  function handlePageRenamed(pageId: number, name: string) {
    setBinder((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        pages: prev.pages.map((p) => (p.id === pageId ? { ...p, name } : p)),
      }
    })
  }

  function handleBinderRenamed(name: string) {
    setBinder((prev) => (prev ? { ...prev, name } : prev))
  }

  // ---- Add page ----

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

  // ---- Guards ----

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
  const isLastSpread = clampedSpread === spreads - 1
  const { left, right } = getSpreadPages(clampedSpread, binder.pages)

  return (
    <div className="binder-builder">
      <div className="binder-builder__body">
        <div className="binder-builder__main">
          <div className="binder-builder__header">
            <Breadcrumb items={[{ label: 'Binders', to: '/binders' }, { label: binder.name }]} />
          </div>
          <button
            type="button"
            className="btn binder-builder__sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle card panel"
          >
            Cards
          </button>
          <div className="binder-builder__spread-wrap">
            <div className="binder-builder__spread-col">
              <div className="binder-builder__title-row">
                <div className="binder-builder__title-page binder-builder__title-page--left">
                  <button
                    type="button"
                    className="btn binder-builder__nav-btn"
                    onClick={() => setCurrentSpread((s) => Math.max(0, s - 1))}
                    disabled={clampedSpread === 0}
                    aria-label="Previous spread"
                  >
                    ‹
                  </button>
                  <BinderPageNameEditor
                    binderId={binder.id}
                    page={left}
                    pages={binder.pages}
                    onRenamed={handlePageRenamed}
                  />
                </div>

                <div className="binder-builder__title-spine" aria-hidden="true" />

                <div className="binder-builder__title-page binder-builder__title-page--right">
                  <BinderPageNameEditor
                    binderId={binder.id}
                    page={right}
                    pages={binder.pages}
                    onRenamed={handlePageRenamed}
                  />
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
              <BinderSpread
                binderId={binder.id}
                binderName={binder.name}
                leftPage={left}
                rightPage={right}
                rows={binder.rows}
                cols={binder.cols}
                onSlotUpdated={handleSlotUpdated}
                onSlotCleared={handleSlotCleared}
                onBinderRenamed={handleBinderRenamed}
              />
            </div>
            {isLastSpread && (
              <div className="binder-builder__add-page-wrap">
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
            )}
          </div>
        </div>

        <aside className="binder-builder__rail">
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
          <BinderSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </aside>
      </div>
    </div>
  )
}
