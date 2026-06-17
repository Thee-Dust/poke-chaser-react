/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../api/types'
import { ensureCsrf, fetchJson, getUrl } from '../utils/api'

const COLLECTION_STORAGE_KEY = 'poke-chaser-collection'

type AuthModalMode = 'login' | 'register'

type AuthContextValue = {
  user: User | null
  loading: boolean
  collection: string[]
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  addToCollection: (cardId: string) => void
  removeFromCollection: (cardId: string) => void
  isInCollection: (cardId: string) => boolean
  authModalOpen: boolean
  authModalMode: AuthModalMode
  openAuthModal: (mode?: AuthModalMode) => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredCollection(): string[] {
  try {
    const raw = localStorage.getItem(COLLECTION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState<string[]>(() => loadStoredCollection())
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login')

  useEffect(() => {
    fetchJson<User>(getUrl('auth/me/'))
      .then(({ json }) => setUser(json))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const persistCollection = useCallback((nextCollection: string[]) => {
    setCollection(nextCollection)
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(nextCollection))
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    await ensureCsrf()
    const { json } = await fetchJson<User>(getUrl('auth/login/'), {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    })
    setUser(json)
  }, [])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await ensureCsrf()
      const { json } = await fetchJson<User>(getUrl('auth/register/'), {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      })
      setUser(json)
    },
    [],
  )

  const logout = useCallback(async () => {
    await ensureCsrf()
    await fetchJson(getUrl('auth/logout/'), { method: 'POST' })
    setUser(null)
  }, [])

  const addToCollection = useCallback(
    (cardId: string) => {
      if (collection.includes(cardId)) return
      persistCollection([...collection, cardId])
    },
    [collection, persistCollection],
  )

  const removeFromCollection = useCallback(
    (cardId: string) => {
      persistCollection(collection.filter((id) => id !== cardId))
    },
    [collection, persistCollection],
  )

  const isInCollection = useCallback(
    (cardId: string) => collection.includes(cardId),
    [collection],
  )

  const openAuthModal = useCallback((mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      collection,
      login,
      register,
      logout,
      addToCollection,
      removeFromCollection,
      isInCollection,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    }),
    [
      user,
      loading,
      collection,
      login,
      register,
      logout,
      addToCollection,
      removeFromCollection,
      isInCollection,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
