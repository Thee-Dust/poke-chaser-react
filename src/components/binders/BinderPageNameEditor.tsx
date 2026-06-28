import { useEffect, useRef, useState } from 'react'
import type { BinderPageData } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'

function getPageDisplayName(page: BinderPageData, pageNumber: number): string {
  const trimmed = page.name.trim()
  return trimmed || `Page ${pageNumber}`
}

type BinderPageNameEditorProps = {
  binderId: number
  page: BinderPageData | null
  pageNumber: number
  className?: string
  onRenamed: (pageId: number, name: string) => void
}

export function BinderPageNameEditor({
  binderId,
  page,
  pageNumber,
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

  const displayName = getPageDisplayName(page, pageNumber)

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
    >
      {displayName}
    </button>
  )
}
