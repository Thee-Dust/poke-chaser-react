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
import type { User, UserUpdatePayload } from '../api/types'
import { ensureCsrf, fetchJson, getUrl } from '../utils/api'
import { parseApiError } from '../utils/apiError'

type AuthModalMode = 'login' | 'register'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<string>
  confirmPasswordReset: (uid: string, token: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: UserUpdatePayload) => Promise<void>
  authModalOpen: boolean
  authModalMode: AuthModalMode
  openAuthModal: (mode?: AuthModalMode) => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function postAuthJson<T>(route: string, body: unknown): Promise<T> {
  await ensureCsrf()
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')
  const csrf = getCsrfToken()
  if (csrf) headers.set('X-CSRFToken', csrf)

  const response = await fetch(getUrl(route), {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const text = await response.text()
  const json = text ? JSON.parse(text) : {}
  if (!response.ok) {
    throw parseApiError(json, response.statusText, response.status)
  }
  return json as T
}

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

  const updateProfile = useCallback(async (payload: UserUpdatePayload) => {
    await ensureCsrf()
    const headers = new Headers()
    headers.set('Accept', 'application/json')
    headers.set('Content-Type', 'application/json')
    const csrf = getCsrfToken()
    if (csrf) headers.set('X-CSRFToken', csrf)

    const response = await fetch(getUrl('auth/me/'), {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const text = await response.text()
    const json = text ? JSON.parse(text) : {}
    if (!response.ok) {
      throw parseApiError(json, response.statusText, response.status)
    }
    setUser(json as User)
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const json = await postAuthJson<{ detail: string }>('auth/password-reset/', { email })
    return json.detail
  }, [])

  const confirmPasswordReset = useCallback(
    async (uid: string, token: string, password: string) => {
      await postAuthJson('auth/password-reset/confirm/', { uid, token, password })
    },
    [],
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
      login,
      register,
      requestPasswordReset,
      confirmPasswordReset,
      logout,
      updateProfile,
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
      requestPasswordReset,
      confirmPasswordReset,
      logout,
      updateProfile,
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
