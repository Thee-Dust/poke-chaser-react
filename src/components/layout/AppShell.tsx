import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import './AppShell.css'

export function AppShell() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''

  function handleSearchSubmit(query: string) {
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      return
    }

    navigate('/')
  }

  return (
    <div className="app-shell">
      <AppHeader searchQuery={searchQuery} onSearchSubmit={handleSearchSubmit} />
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  )
}
