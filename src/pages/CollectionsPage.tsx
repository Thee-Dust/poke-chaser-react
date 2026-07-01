import { useEffect, useState } from 'react'
import type { CollectionSummary } from '../api/types'
import { CollectionGrid } from '../components/collections/CollectionGrid'
import { CreateCollectionModal } from '../components/collections/CreateCollectionModal'
import { DeleteCollectionModal } from '../components/collections/DeleteCollectionModal'
import { useData } from '../providers/DataProviderContext'

export function CollectionsPage() {
  const data = useData()
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CollectionSummary | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const list = await data.getCollections()
        if (!cancelled) {
          setCollections(list)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load collections. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [data])

  function handleCreated(collection: CollectionSummary) {
    setCollections((prev) => [...prev, collection])
    setModalOpen(false)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    await data.deleteCollection(deleteTarget.id)
    setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const defaultName = `Collection ${collections.length + 1}`

  return (
    <div className="page">
      <div className="page__header page__header--centered">
        <h1>My Collections</h1>
      </div>
      {error && <p className="page__error">{error}</p>}
      <CollectionGrid
        collections={collections}
        loading={loading}
        onNewCollection={() => setModalOpen(true)}
        onDelete={(c) => setDeleteTarget(c)}
      />
      {modalOpen && (
        <CreateCollectionModal
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
