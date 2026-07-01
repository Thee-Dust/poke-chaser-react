import { useEffect, useState } from 'react'
import type { BinderSummary } from '../api/types'
import { BinderGrid } from '../components/binders/BinderGrid'
import { CreateBinderModal } from '../components/binders/CreateBinderModal'
import { DeleteCollectionModal } from '../components/collections/DeleteCollectionModal'
import { useData } from '../providers/DataProviderContext'
import './BindersPage.css'

export function BindersPage() {
  const data = useData()

  const [binders, setBinders] = useState<BinderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BinderSummary | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const list = await data.getBinders()
        if (!cancelled) setBinders(list)
      } catch {
        if (!cancelled) setError('Failed to load binders. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [data])

  function handleCreated(binder: BinderSummary) {
    setBinders((prev) => [...prev, { ...binder, page_count: 0, card_count: 0 }])
    setModalOpen(false)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    await data.deleteBinder(deleteTarget.id)
    setBinders((prev) => prev.filter((b) => b.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const defaultName = `Binder ${binders.length + 1}`

  return (
    <div className="page">
      <div className="page__header page__header--centered">
        <h1>My Binders</h1>
      </div>

      {error && <p className="page__error">{error}</p>}

      {!loading && !error && binders.length === 0 ? (
        <div className="binders-page__empty">
          <p className="binders-page__empty-title">No binders yet</p>
          <p className="binders-page__empty-text">
            Create a binder to start organizing your cards visually.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            + New binder
          </button>
        </div>
      ) : (
        <BinderGrid
          binders={binders}
          loading={loading}
          onNewBinder={() => setModalOpen(true)}
          onDelete={(b) => setDeleteTarget(b)}
        />
      )}

      {modalOpen && (
        <CreateBinderModal
          defaultName={defaultName}
          onCreated={handleCreated}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deleteTarget && (
        <DeleteCollectionModal
          collectionName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
