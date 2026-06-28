import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import type { BinderDetail, BinderPageData, BinderSlotData } from '../api/types'
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

  // Data
  const [binder, setBinder] = useState<BinderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation
  const [currentSpread, setCurrentSpread] = useState(0)
  const [addingPage, setAddingPage] = useState(false)

  // Binder name editing
  const [editingName, setEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [savingName, setSavingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }
  }, [editingName])

  // ---- Binder name ----

  function startEditingName() {
    setEditNameValue(binder?.name ?? '')
    setEditingName(true)
  }

  async function handleSaveName() {
    const trimmed = editNameValue.trim()
    if (!trimmed || !binder) { setEditingName(false); return }
    if (trimmed === binder.name) { setEditingName(false); return }
    setSavingName(true)
    try {
      await data.updateBinder(binder.id, trimmed)
      setBinder((prev) => (prev ? { ...prev, name: trimmed } : prev))
      setEditingName(false)
    } finally {
      setSavingName(false)
    }
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void handleSaveName()
    if (e.key === 'Escape') setEditingName(false)
  }

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
  const { left, right } = getSpreadPages(clampedSpread, binder.pages)

  return (
    <div className="binder-builder">
      <div className="binder-builder__header">
        <Breadcrumb items={[{ label: 'Binders', to: '/binders' }, { label: binder.name }]} />
      </div>

      <div className="binder-builder__workspace">
        <div className="binder-builder__spread-wrap">
          <div className="binder-builder__spread-col">
            <div className="binder-builder__title-row">
              <button
                type="button"
                className="btn binder-builder__nav-btn"
                onClick={() => setCurrentSpread((s) => Math.max(0, s - 1))}
                disabled={clampedSpread === 0}
                aria-label="Previous spread"
              >
                ‹
              </button>

              {editingName ? (
                <input
                  ref={nameInputRef}
                  className="binder-builder__name-input"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onBlur={() => void handleSaveName()}
                  onKeyDown={handleNameKeyDown}
                  disabled={savingName}
                  aria-label="Binder name"
                />
              ) : (
                <h1
                  className="binder-builder__title"
                  onDoubleClick={startEditingName}
                  title="Double-click to rename"
                >
                  {binder.name}
                </h1>
              )}

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
            <BinderSpread
              binderId={binder.id}
              binderName={binder.name}
              leftPage={left}
              rightPage={right}
              rows={binder.rows}
              cols={binder.cols}
              onSlotUpdated={handleSlotUpdated}
              onSlotCleared={handleSlotCleared}
              onPageRenamed={handlePageRenamed}
            />
          </div>
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
        </div>

        <div className="binder-builder__aside">
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
            className="btn binder-builder__sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle card panel"
          >
            Cards
          </button>
          <BinderSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
    </div>
  )
}
