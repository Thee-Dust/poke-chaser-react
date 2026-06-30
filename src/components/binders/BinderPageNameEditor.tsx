import { useEffect, useRef, useState } from 'react'
import type { BinderPageData } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import { getPageDisplayName } from './binderPageLabels'

type BinderPageNameEditorProps = {
  binderId: number
  page: BinderPageData | null
  pages: BinderPageData[]
  className?: string
  onRenamed: (pageId: number, name: string) => void
}

export function BinderPageNameEditor({
  binderId,
  page,
  pages,
  className = 'binder-builder__page-name',
  onRenamed,
}: BinderPageNameEditorProps) {
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

  if (!page) return null

  const displayName = getPageDisplayName(page, pages)

  function startEditing() {
    setEditName(page!.name.trim() || displayName)
    setEditing(true)
  }

  async function handleSave() {
    const trimmed = editName.trim()
    if (!trimmed) { setEditing(false); return }
    if (trimmed === page!.name.trim()) { setEditing(false); return }
    setSaving(true)
    try {
      await data.updateBinderPage(binderId, page!.id, trimmed)
      onRenamed(page!.id, trimmed)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="binder-builder__page-name-input"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        onBlur={() => void handleSave()}
        onKeyDown={handleKeyDown}
        disabled={saving}
        aria-label="Page name"
      />
    )
  }

  return (
    <button
      type="button"
      className={className}
      onClick={startEditing}
      title="Click to rename"
      aria-label={`Rename page: ${displayName}`}
    >
      <span className="binder-builder__page-name-text">{displayName}</span>
      <span className="binder-builder__page-name-edit" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.5 2.5a2.121 2.121 0 1 1 3 3L5 15H1v-4L11.5 2.5Z" />
        </svg>
      </span>
    </button>
  )
}
