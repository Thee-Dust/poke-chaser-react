import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AppHeader.css'

type AppHeaderProps = {
  searchQuery?: string
  onSearchSubmit?: (query: string) => void
}

export function AppHeader({ searchQuery = '', onSearchSubmit }: AppHeaderProps) {
  const { user, logout } = useAuth()

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('search') ?? '').trim()
    onSearchSubmit?.(query)
  }

  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo">
        Poke Chaser
      </Link>

      <form className="app-header__search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          name="search"
          defaultValue={searchQuery}
          key={searchQuery}
          placeholder="Search cards by name..."
          aria-label="Search cards"
        />
        <button type="submit">Search</button>
      </form>

      <nav className="app-header__auth" aria-label="Account">
        {user ? (
          <>
            <Link to="/collection">My Collection</Link>
            <span className="app-header__user">{user.name}</span>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="app-header__signup">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
