import { useEffect, useState } from 'react'
import type { Set } from '../api/types'
import { SetGrid } from '../components/sets/SetGrid'
import { Pagination } from '../components/ui/Pagination'
import { useData } from '../providers/DataProviderContext'

const SORT_OPTIONS = [
  { value: 'release_date_desc', label: 'Release date (newest)' },
  { value: 'release_date_asc', label: 'Release date (oldest)' },
  { value: 'name_asc', label: 'A–Z' },
  { value: 'name_desc', label: 'Z–A' },
] as const

export function DashboardPage() {
  const data = useData()
  const [sets, setSets] = useState<Set[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [sort, setSort] = useState<string>('release_date_desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSets() {
      setLoading(true)
      setError(null)

      try {
        const result = await data.getSets(page, sort)
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
  }, [data, page, sort])

  return (
    <div className="page">
      <div className="page__header">
        <h1>Browse Sets</h1>
        <label className="page__sort">
          <span className="page__sort-label">Sort</span>
          <select
            className="page__sort-select"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value)
              setPage(1)
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="page__error">{error}</p>}
      <SetGrid sets={sets} loading={loading} />
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  )
}
