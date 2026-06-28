import { useEffect, useRef, useState } from 'react'
import { useData } from '../../providers/DataProviderContext'

type BinderCoverNameEditorProps = {
  binderId: number
  name: string
  onRenamed: (name: string) => void
}

export function BinderCoverNameEditor({
  binderId,
  name,
  onRenamed,
}: BinderCoverNameEditorProps) {
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
    setEditName(name)
    setEditing(true)
  }

  async function handleSave() {
    const trimmed = editName.trim()
    if (!trimmed) { setEditing(false); return }
    if (trimmed === name) { setEditing(false); return }
    setSaving(true)
    try {
      await data.updateBinder(binderId, trimmed)
      onRenamed(trimmed)
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
        className="binder-spread__cover-name-input"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        onBlur={() => void handleSave()}
        onKeyDown={handleKeyDown}
        disabled={saving}
        aria-label="Binder name"
      />
    )
  }

  return (
    <button
      type="button"
      className="binder-spread__cover-name"
      onClick={startEditing}
      title="Click to rename"
    >
      {name}
    </button>
  )
}
