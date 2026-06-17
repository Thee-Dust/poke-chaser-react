import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AuthModal.css'

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } =
    useAuth()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: boolean; password?: boolean }>({})
  const [submitting, setSubmitting] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authModalOpen) return
    setEmail('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setFieldErrors({})
    setSubmitting(false)
  }, [authModalOpen, authModalMode])

  useEffect(() => {
    if (!authModalOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAuthModal()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [authModalOpen, closeAuthModal])

  if (!authModalOpen) return null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (authModalMode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (authModalMode === 'login') {
      const identifierMissing = email.trim() === ''
      const passwordMissing = password === ''
      if (identifierMissing || passwordMissing) {
        setFieldErrors({ identifier: identifierMissing, password: passwordMissing })
        setError(null)
        return
      }
      setFieldErrors({})
    }
    setSubmitting(true)
    setError(null)
    try {
      if (authModalMode === 'login') {
        await login(email, password)
      } else {
        await register(username, email, password)
      }
      closeAuthModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      closeAuthModal()
    }
  }

  const isLogin = authModalMode === 'login'
  const registerComplete =
    username.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    confirmPassword !== ''

  return (
    <div className="auth-modal__overlay" onClick={handleOverlayClick} aria-modal="true" role="dialog" aria-label={isLogin ? 'Log in' : 'Create account'}>
      <div className="auth-modal" ref={dialogRef}>
        <button
          type="button"
          className="auth-modal__close"
          onClick={closeAuthModal}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="auth-modal__tabs">
          <button
            type="button"
            className={`auth-modal__tab${isLogin ? ' auth-modal__tab--active' : ''}`}
            onClick={() => openAuthModal('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-modal__tab${!isLogin ? ' auth-modal__tab--active' : ''}`}
            onClick={() => openAuthModal('register')}
          >
            Sign up
          </button>
        </div>

        <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <label className="auth-modal__label">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </label>
          )}

          <label className="auth-modal__label">
            <span>{isLogin ? 'Email or username' : 'Email'}</span>
            <input
              type={isLogin ? 'text' : 'email'}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.identifier) {
                  setFieldErrors((prev) => ({ ...prev, identifier: false }))
                }
              }}
              required
              autoComplete={isLogin ? 'username' : 'email'}
              autoFocus={isLogin}
              className={isLogin && fieldErrors.identifier ? 'auth-modal__input--error' : undefined}
            />
            {isLogin && fieldErrors.identifier && (
              <span className="auth-modal__field-error">Required</span>
            )}
          </label>

          <label className="auth-modal__label">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: false }))
                }
              }}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className={isLogin && fieldErrors.password ? 'auth-modal__input--error' : undefined}
            />
            {isLogin && fieldErrors.password && (
              <span className="auth-modal__field-error">Required</span>
            )}
          </label>

          {!isLogin && (
            <label className="auth-modal__label">
              <span>Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <p className="auth-modal__error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || (!isLogin && !registerComplete)}
          >
            {submitting
              ? isLogin
                ? 'Logging in...'
                : 'Creating account...'
              : isLogin
                ? 'Log in'
                : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
