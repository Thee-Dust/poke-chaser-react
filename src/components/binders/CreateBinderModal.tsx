import { useEffect, useRef, useState } from 'react'
import type { BinderSize, BinderSummary } from '../../api/types'
import { useData } from '../../providers/DataProviderContext'
import './CreateBinderModal.css'

type CreateBinderModalProps = {
  defaultName: string
  onCreated: (binder: BinderSummary) => void
  onClose: () => void
}

export function CreateBinderModal({ defaultName, onCreated, onClose }: CreateBinderModalProps) {
  const data = useData()
  const [name, setName] = useState(defaultName)
  const [sizes, setSizes] = useState<BinderSize[]>([])
  const [selectedSize, setSelectedSize] = useState<BinderSize | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    async function loadSizes() {
      try {
        const result = await data.getBinderSizes()
        setSizes(result)
        if (result.length > 0) setSelectedSize(result[0])
      } catch {
        setError('Failed to load binder sizes.')
      }
    }
    void loadSizes()
  }, [data])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const match = sizes.find((s) => `${s.rows}x${s.cols}` === e.target.value)
    if (match) setSelectedSize(match)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !selectedSize) return

    setSubmitting(true)
    setError(null)

    try {
      const binder = await data.createBinder(trimmed, selectedSize.rows, selectedSize.cols)
      await data.addBinderPage(binder.id)
      onCreated(binder)
    } catch {
      setError('Failed to create binder. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="create-binder-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label="New binder"
    >
      <div className="create-binder-modal">
        <button
          type="button"
          className="create-binder-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="create-binder-modal__title">New binder</h2>

        <form className="create-binder-modal__form" onSubmit={handleSubmit} noValidate>
          <label className="create-binder-modal__label">
            <span>Name</span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
              disabled={submitting}
            />
          </label>

          <label className="create-binder-modal__label">
            <span>Size</span>
            <select
              value={selectedSize ? `${selectedSize.rows}x${selectedSize.cols}` : ''}
              onChange={handleSizeChange}
              disabled={submitting || sizes.length === 0}
            >
              {sizes.map((s) => (
                <option key={s.label} value={`${s.rows}x${s.cols}`}>
                  {s.label} ({s.capacity} cards)
                </option>
              ))}
            </select>
          </label>

          {error && <p className="create-binder-modal__error">{error}</p>}

          <div className="create-binder-modal__actions">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || !name.trim() || !selectedSize}
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
