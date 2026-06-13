import { useEffect, useState } from 'react'
import type { Set } from '../api/types'
import { SetGrid } from '../components/sets/SetGrid'
import { Pagination } from '../components/ui/Pagination'
import { useData } from '../providers/DataProviderContext'

export function DashboardPage() {
  const data = useData()
  const [sets, setSets] = useState<Set[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSets() {
      setLoading(true)
      setError(null)

      try {
        const result = await data.getSets(page)
        if (!cancelled) {
          setSets(result.sets)
          setPages(result.pages)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load sets. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSets()

    return () => {
      cancelled = true
    }
  }, [data, page])

  return (
    <div className="page">
      <h1>Browse Sets</h1>
      {error && <p className="page__error">{error}</p>}
      <SetGrid sets={sets} loading={loading} />
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  )
}
