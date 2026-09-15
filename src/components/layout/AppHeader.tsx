import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../providers/DataProviderContext'
import { useTheme } from '../../context/ThemeContext'
import { setPath } from '../../utils/setSlug'
import './AppHeader.css'

const LOGO_BY_THEME = {
  light: '/pokechaser-logo-light-mode.png',
  dark: '/pokechaser-logo-dark-mode.png',
} as const

type AppHeaderProps = {
  searchQuery?: string
  onSearchSubmit?: (query: string) => void
}

type HeaderSearchFormProps = {
  initialQuery: string
  onSearchSubmit?: (query: string) => void
}

type SetSuggestion = { id: string; name: string; series: string }

function HeaderSearchForm({ initialQuery, onSearchSubmit }: HeaderSearchFormProps) {
  const data = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialQuery)
  const [cardSuggestions, setCardSuggestions] = useState<string[]>([])
  const [setSuggestions, setSetSuggestions] = useState<SetSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const totalSuggestions = cardSuggestions.length + setSuggestions.length

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    setActiveIndex(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.replace(/\s/g, '').length < 3) {
      setCardSuggestions([])
      setSetSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      void Promise.all([
        data.suggestCards(value),
        data.suggestSets(value),
      ]).then(([cards, sets]) => {
        setCardSuggestions(cards)
        setSetSuggestions(sets)
        setOpen(cards.length > 0 || sets.length > 0)
      }).catch(() => {
        setCardSuggestions([])
        setSetSuggestions([])
        setOpen(false)
      })
    }, 300)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOpen(false)
    onSearchSubmit?.(query.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, totalSuggestions - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      if (activeIndex < cardSuggestions.length) {
        selectCard(cardSuggestions[activeIndex])
      } else {
        selectSet(setSuggestions[activeIndex - cardSuggestions.length])
      }
    }
  }

  function selectCard(name: string) {
    setQuery(name)
    setOpen(false)
    setActiveIndex(-1)
    onSearchSubmit?.(name)
  }

  function selectSet(set: SetSuggestion) {
    setOpen(false)
    setActiveIndex(-1)
    navigate(setPath(set))
  }

  return (
    <div className="app-header__search-wrap" ref={wrapRef}>
      <form className="app-header__search" onSubmit={handleSubmit}>
        <input
          type="search"
          name="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search cards by name..."
          aria-label="Search cards"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? 'app-header-suggest' : undefined}
        />
        <button
          type="submit"
          className="app-header__search-btn"
          disabled={!query.trim()}
          aria-label="Search"
        >
          <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6.5" cy="6.5" r="4" />
            <path d="M10 10l3.5 3.5" />
          </svg>
        </button>
      </form>
      {open && totalSuggestions > 0 && (
        <ul
          id="app-header-suggest"
          className="app-header__suggest"
          role="listbox"
          aria-label="Search suggestions"
        >
          {cardSuggestions.length > 0 && (
            <>
              <li className="app-header__suggest-label" aria-hidden="true">Cards</li>
              {cardSuggestions.map((name, i) => (
                <li
                  key={name}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`app-header__suggest-item${i === activeIndex ? ' app-header__suggest-item--active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); selectCard(name) }}
                >
                  {name}
                </li>
              ))}
            </>
          )}
          {setSuggestions.length > 0 && (
            <>
              <li className="app-header__suggest-label" aria-hidden="true">Sets</li>
              {setSuggestions.map((set, i) => {
                const idx = cardSuggestions.length + i
                return (
                  <li
                    key={set.id}
                    role="option"
                    aria-selected={idx === activeIndex}
                    className={`app-header__suggest-item${idx === activeIndex ? ' app-header__suggest-item--active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); selectSet(set) }}
                  >
                    {set.name}
                  </li>
                )
              })}
            </>
          )}
        </ul>
      )}
    </div>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.9 2.9l1.1 1.1M12 12l1.1 1.1M2.9 13.1l1.1-1.1M12 4l1.1-1.1" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9.2A6.5 6.5 0 0 1 6.8 2 6.5 6.5 0 1 0 14 9.2Z" />
    </svg>
  )
}

export function AppHeader({ searchQuery = '', onSearchSubmit }: AppHeaderProps) {
  const { user, loading, logout, openAuthModal } = useAuth()
  const { theme, toggleTheme } = useTheme()
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

  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo">
        <img
          src={LOGO_BY_THEME[theme]}
          alt="Poke Chaser"
          className="app-header__logo-image"
          width={80}
          height={80}
        />
      </Link>

      <HeaderSearchForm
        key={searchQuery}
        initialQuery={searchQuery}
        onSearchSubmit={onSearchSubmit}
      />

      <button
        type="button"
        className="app-header__theme-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="app-header__theme-icon app-header__theme-icon--current" aria-hidden="true">
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </span>
        <span className="app-header__theme-icon app-header__theme-icon--hover" aria-hidden="true">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </span>
      </button>

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
                  to="/profile"
                  className="app-header__menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/collections"
                  className="app-header__menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Collections
                </NavLink>
                <NavLink
                  to="/binders"
                  className="app-header__menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Binders
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
