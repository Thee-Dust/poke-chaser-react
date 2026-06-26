import { useEffect, useRef, useState } from 'react'
import type { BinderPageData, BinderSlotData } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import { BinderSlot } from './BinderSlot'

type BinderPageProps = {
  binderId: number
  page: BinderPageData
  rows: number
  cols: number
  onSlotUpdated: (pageId: number, position: number, slot: BinderSlotData) => void
  onSlotCleared: (pageId: number, position: number) => void
  onPageRenamed: (pageId: number, name: string) => void
}

export function BinderPage({
  binderId,
  page,
  cols,
  onSlotUpdated,
  onSlotCleared,
  onPageRenamed,
}: BinderPageProps) {
  const data = useData()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEditing() {
    setEditName(page.name)
    setEditing(true)
  }

  async function handleSave() {
    const trimmed = editName.trim()
    if (!trimmed) { setEditing(false); return }
    if (trimmed === page.name) { setEditing(false); return }
    setSaving(true)
    try {
      await data.updateBinderPage(binderId, page.id, trimmed)
      onPageRenamed(page.id, trimmed)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="binder-page-wrap">
      <div className="binder-page__name-row">
        {editing ? (
          <input
            ref={inputRef}
            className="binder-page__name-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => void handleSave()}
            onKeyDown={handleKeyDown}
            disabled={saving}
            aria-label="Page name"
          />
        ) : (
          <span
            className="binder-page__name"
            onDoubleClick={startEditing}
            title="Double-click to rename"
          >
            {page.name}
          </span>
        )}
      </div>

      <div
        className="binder-page"
        style={{ '--binder-cols': cols } as React.CSSProperties}
      >
        {Array.from({ length: page.capacity }).map((_, pos) => {
          const slot = page.slots.find((s) => s.position === pos) ?? null
          return (
            <BinderSlot
              key={pos}
              binderId={binderId}
              pageId={page.id}
              position={pos}
              card={slot?.card ?? null}
              onSlotUpdated={onSlotUpdated}
              onSlotCleared={onSlotCleared}
            />
          )
        })}
      </div>
    </div>
  )
}
