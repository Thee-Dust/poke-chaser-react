import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import type { BinderDetail, BinderPageData, BinderSlotData } from '../api/types'
import { BinderPageNameEditor } from '../components/binders/BinderPageNameEditor'
import { getPageDisplayName } from '../components/binders/binderPageLabels'
import { BinderSidebar } from '../components/binders/BinderSidebar'
import { BinderSpread } from '../components/binders/BinderSpread'
import type { BinderSlotMoveHandler } from '../components/binders/BinderSlot'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { useData } from '../providers/DataProviderContext'
import { useMediaQuery } from '../utils/useMediaQuery'
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

function getTotalPageViews(pages: BinderPageData[]): number {
  return 1 + pages.length
}

function getPageViewPage(view: number, pages: BinderPageData[]): BinderPageData | null {
  if (view <= 0) return null
  return pages[view - 1] ?? null
}

function getPageViewLabel(view: number, pages: BinderPageData[]): string {
  if (view <= 0) return 'Cover'
  const page = pages[view - 1]
  if (!page) return 'Cover'
  return getPageDisplayName(page, pages)
}

function pageViewToSpread(view: number): number {
  if (view <= 0) return 0
  const pageIndex = view - 1
  if (pageIndex === 0) return 0
  return Math.ceil(pageIndex / 2)
}

function spreadToPageView(spread: number): number {
  if (spread <= 0) return 0
  return 2 * spread
}

type PendingSlotWrite = {
  pageId: number
  position: number
  cardId: string | null
}

function getSlotWriteKey(pageId: number, position: number) {
  return `${pageId}:${position}`
}

function syncCommittedSlotsRef(
  binder: BinderDetail | null,
  ref: { current: Map<string, boolean> },
) {
  const slotKeys = new Map<string, boolean>()
  binder?.pages.forEach((p) =>
    p.slots.forEach((s) => slotKeys.set(getSlotWriteKey(p.id, s.position), true)),
  )
  ref.current = slotKeys
}

export function BinderBuilderPage() {
  const { binderId } = useParams<{ binderId: string }>()
  const data = useData()
  const isNarrow = useMediaQuery('(max-width: 640px)')

  // Data
  const [binder, setBinder] = useState<BinderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation
  const [currentSpread, setCurrentSpread] = useState(0)
  const [currentPageView, setCurrentPageView] = useState(0)
  const [addingPage, setAddingPage] = useState(false)
  const pendingSlotWritesRef = useRef<Map<string, PendingSlotWrite>>(new Map())
  const committedSlotsRef = useRef<Map<string, boolean>>(new Map())
  const slotWriteTimerRef = useRef<number | null>(null)
  const wasNarrowRef = useRef(isNarrow)

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
        if (!cancelled) {
          setBinder(result ?? null)
          syncCommittedSlotsRef(result ?? null, committedSlotsRef)
        }
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

  useEffect(() => {
    return () => {
      if (slotWriteTimerRef.current != null) {
        window.clearTimeout(slotWriteTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (wasNarrowRef.current === isNarrow) return

    if (isNarrow) {
      setCurrentPageView(spreadToPageView(currentSpread))
    } else {
      setCurrentSpread(pageViewToSpread(currentPageView))
    }
    wasNarrowRef.current = isNarrow
    // Remap only when crossing the breakpoint; use indices from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [isNarrow])

  // ---- Slot handlers ----

  async function flushPendingSlotWrites() {
    if (slotWriteTimerRef.current != null) {
      window.clearTimeout(slotWriteTimerRef.current)
      slotWriteTimerRef.current = null
    }

    const writes = Array.from(pendingSlotWritesRef.current.values())
    if (writes.length === 0) return

    pendingSlotWritesRef.current.clear()

    try {
      await Promise.all(
        writes.map((write) => {
          const key = getSlotWriteKey(write.pageId, write.position)
          if (write.cardId) {
            committedSlotsRef.current.set(key, true)
            return data.setSlotCard(activeId, write.pageId, write.position, write.cardId)
          }
          if (!committedSlotsRef.current.has(key)) {
            return Promise.resolve()
          }
          committedSlotsRef.current.delete(key)
          return data.clearSlotCard(activeId, write.pageId, write.position)
        }),
      )
    } catch {
      try {
        const latest = await data.getBinder(activeId)
        setBinder(latest ?? null)
        syncCommittedSlotsRef(latest ?? null, committedSlotsRef)
      } catch {
        setError('Failed to save binder slot changes.')
      }
    }
  }

  function queueSlotWrite(write: PendingSlotWrite) {
    pendingSlotWritesRef.current.set(getSlotWriteKey(write.pageId, write.position), write)

    if (slotWriteTimerRef.current != null) {
      window.clearTimeout(slotWriteTimerRef.current)
    }

    slotWriteTimerRef.current = window.setTimeout(() => {
      void flushPendingSlotWrites()
    }, 1000)
  }

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

  const handleSlotMoved: BinderSlotMoveHandler = (source, target) => {
    if (source.pageId === target.pageId && source.position === target.position) return

    setBinder((prev) => {
      if (!prev) return prev

      const sourcePage = prev.pages.find((p) => p.id === source.pageId)
      const targetPage = prev.pages.find((p) => p.id === target.pageId)
      const sourceSlot = sourcePage?.slots.find((s) => s.position === source.position)
      const targetSlot = targetPage?.slots.find((s) => s.position === target.position)

      if (!sourcePage || !targetPage || !sourceSlot) return prev

      queueSlotWrite({
        pageId: source.pageId,
        position: source.position,
        cardId: targetSlot?.card.id ?? null,
      })
      queueSlotWrite({
        pageId: target.pageId,
        position: target.position,
        cardId: sourceSlot.card.id,
      })

      return {
        ...prev,
        pages: prev.pages.map((page) => {
          if (page.id !== source.pageId && page.id !== target.pageId) return page

          const slots = page.slots.filter((slot) => {
            if (page.id === source.pageId && slot.position === source.position) return false
            if (page.id === target.pageId && slot.position === target.position) return false
            return true
          })

          if (page.id === target.pageId) {
            slots.push({ ...sourceSlot, position: target.position })
          }

          if (targetSlot && page.id === source.pageId) {
            slots.push({ ...targetSlot, position: source.position })
          }

          return { ...page, slots }
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
      setCurrentPageView(getTotalPageViews(updatedPages) - 1)
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
  const pageViews = getTotalPageViews(binder.pages)
  const clampedSpread = Math.min(currentSpread, spreads - 1)
  const clampedPageView = Math.min(currentPageView, pageViews - 1)
  const isLastSpread = clampedSpread === spreads - 1
  const isLastPageView = clampedPageView === pageViews - 1
  const { left, right } = getSpreadPages(clampedSpread, binder.pages)
  const singlePage = getPageViewPage(clampedPageView, binder.pages)
  const showAddPage = isNarrow ? isLastPageView : isLastSpread

  return (
    <div className="binder-builder">
      <div className="binder-builder__body">
        <div className="binder-builder__main">
          <div className="binder-builder__header">
            <Breadcrumb items={[{ label: 'Binders', to: '/binders' }, { label: binder.name }]} />
          </div>
          <div className="binder-builder__toolbar">
            <label className="binder-builder__jump-label binder-builder__jump-label--toolbar">
              <span className="binder-builder__jump-title">Jump to page</span>
              <select
                className="binder-builder__jump-select"
                value={isNarrow ? clampedPageView : clampedSpread}
                aria-label="Jump to page"
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (isNarrow) setCurrentPageView(next)
                  else setCurrentSpread(next)
                }}
              >
                {isNarrow
                  ? Array.from({ length: pageViews }).map((_, i) => (
                      <option key={i} value={i}>
                        {getPageViewLabel(i, binder.pages)}
                      </option>
                    ))
                  : Array.from({ length: spreads }).map((_, i) => (
                      <option key={i} value={i}>
                        {getSpreadLabel(i, binder.pages)}
                      </option>
                    ))}
              </select>
            </label>
            <button
              type="button"
              className="btn binder-builder__sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle card panel"
            >
              Cards
            </button>
          </div>
          <div className="binder-builder__spread-wrap">
            <div className="binder-builder__spread-col">
              {isNarrow ? (
                <div className="binder-builder__title-row binder-builder__title-row--single">
                  <button
                    type="button"
                    className="btn binder-builder__nav-btn"
                    onClick={() => setCurrentPageView((v) => Math.max(0, v - 1))}
                    disabled={clampedPageView === 0}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {singlePage ? (
                    <BinderPageNameEditor
                      binderId={binder.id}
                      page={singlePage}
                      pages={binder.pages}
                      onRenamed={handlePageRenamed}
                    />
                  ) : (
                    <span className="binder-builder__page-name binder-builder__page-name--static">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn binder-builder__nav-btn"
                    onClick={() => setCurrentPageView((v) => Math.min(pageViews - 1, v + 1))}
                    disabled={clampedPageView >= pageViews - 1}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              ) : (
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
              )}
              <BinderSpread
                binderId={binder.id}
                binderName={binder.name}
                leftPage={isNarrow ? singlePage : left}
                rightPage={isNarrow ? null : right}
                layout={isNarrow ? 'single' : 'spread'}
                rows={binder.rows}
                cols={binder.cols}
                onSlotUpdated={handleSlotUpdated}
                onSlotCleared={handleSlotCleared}
                onSlotMoved={handleSlotMoved}
                onBinderRenamed={handleBinderRenamed}
              />
            </div>
            {showAddPage && (
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
            <span className="binder-builder__jump-title">Current page</span>
            <select
              className="binder-builder__jump-select"
              value={clampedSpread}
              aria-label="Jump to page"
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
