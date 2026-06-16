/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../api/types'

const AUTH_STORAGE_KEY = 'poke-chaser-auth'
const COLLECTION_STORAGE_KEY = 'poke-chaser-collection'

type AuthContextValue = {
  user: User | null
  collection: string[]
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  addToCollection: (cardId: string) => void
  removeFromCollection: (cardId: string) => void
  isInCollection: (cardId: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function loadStoredCollection(): string[] {
  try {
    const raw = localStorage.getItem(COLLECTION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredUser())
  const [collection, setCollection] = useState<string[]>(() => loadStoredCollection())

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [])

  const persistCollection = useCallback((nextCollection: string[]) => {
    setCollection(nextCollection)
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(nextCollection))
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      void password
      const nextUser: User = {
        id: 'local-user',
        email,
        name: email.split('@')[0] || 'Trainer',
      }
      persistUser(nextUser)
    },
    [persistUser],
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      void password
      const nextUser: User = {
        id: 'local-user',
        email,
        name: name || email.split('@')[0] || 'Trainer',
      }
      persistUser(nextUser)
    },
    [persistUser],
  )

  const logout = useCallback(() => {
    persistUser(null)
  }, [persistUser])

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

  const value = useMemo(
    () => ({
      user,
      collection,
      login,
      signup,
      logout,
      addToCollection,
      removeFromCollection,
      isInCollection,
    }),
    [
      user,
      collection,
      login,
      signup,
      logout,
      addToCollection,
      removeFromCollection,
      isInCollection,
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
