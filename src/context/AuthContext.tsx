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

type AuthModalMode = 'login' | 'register'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  authModalOpen: boolean
  authModalMode: AuthModalMode
  openAuthModal: (mode?: AuthModalMode) => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login')

  useEffect(() => {
    fetchJson<User>(getUrl('auth/me/'))
      .then(({ json }) => setUser(json))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
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
      login,
      register,
      logout,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
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
