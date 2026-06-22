import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AppHeader.css'

type AppHeaderProps = {
  searchQuery?: string
  onSearchSubmit?: (query: string) => void
}

export function AppHeader({ searchQuery = '', onSearchSubmit }: AppHeaderProps) {
  const { user, loading, logout, openAuthModal } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

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
        {loading ? null : user ? (
          <div className="app-header__user-menu" ref={menuRef}>
            <button
              type="button"
              className="app-header__user-btn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {user.username}
              <span className="app-header__user-caret" aria-hidden="true">
                {menuOpen ? '▴' : '▾'}
              </span>
            </button>

            {menuOpen && (
              <div className="app-header__menu" role="menu">
                <NavLink
                  to="/collections"
                  className="app-header__menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Collections
                </NavLink>
                <button
                  type="button"
                  className="app-header__menu-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    void logout()
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button type="button" onClick={() => openAuthModal('login')}>
              Log in
            </button>
            <button
              type="button"
              className="app-header__signup"
              onClick={() => openAuthModal('register')}
            >
              Sign up
            </button>
          </>
        )}
      </nav>
    </header>
  )
}
