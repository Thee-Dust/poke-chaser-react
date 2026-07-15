import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { isValidUsername, USERNAME_INVALID_MESSAGE } from '../../utils/username'
import './AuthModal.css'

type FormView = 'auth' | 'reset-request'

export function AuthModal() {
  const {
    authModalMode,
    closeAuthModal,
    login,
    register,
    requestPasswordReset,
    openAuthModal,
  } = useAuth()

  const [formView, setFormView] = useState<FormView>('auth')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: boolean; password?: boolean }>({})
  const [submitting, setSubmitting] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)

  function resetForm() {
    setFormView('auth')
    setEmail('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setResetSuccess(null)
    setFieldErrors({})
    setSubmitting(false)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAuthModal()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeAuthModal])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (authModalMode === 'register' && !isValidUsername(username)) {
      setError(USERNAME_INVALID_MESSAGE)
      return
    }
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

  async function handleResetSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (email.trim() === '') return

    setSubmitting(true)
    setError(null)
    setResetSuccess(null)
    try {
      const message = await requestPasswordReset(email.trim())
      setResetSuccess(message)
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

  const dialogLabel =
    formView === 'reset-request' ? 'Reset password' : isLogin ? 'Log in' : 'Create account'

  return (
    <div
      className="auth-modal__overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label={dialogLabel}
    >
      <div className="auth-modal" ref={dialogRef}>
        <button
          type="button"
          className="auth-modal__close"
          onClick={closeAuthModal}
          aria-label="Close"
        >
          ✕
        </button>

        {formView === 'auth' && (
          <div className="auth-modal__tabs">
            <button
              type="button"
              className={`auth-modal__tab${isLogin ? ' auth-modal__tab--active' : ''}`}
              onClick={() => {
                resetForm()
                openAuthModal('login')
              }}
            >
              Log in
            </button>
            <button
              type="button"
              className={`auth-modal__tab${!isLogin ? ' auth-modal__tab--active' : ''}`}
              onClick={() => {
                resetForm()
                openAuthModal('register')
              }}
            >
              Sign up
            </button>
          </div>
        )}

        {formView === 'reset-request' ? (
          <>
            <h2 className="auth-modal__title">Reset password</h2>
            <p className="auth-modal__helper">
              Enter your account email and we&apos;ll send you a link to set a new password.
            </p>

            <form className="auth-modal__form" onSubmit={handleResetSubmit} noValidate>
              <label className="auth-modal__label">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={!!resetSuccess}
                />
              </label>

              {error && <p className="auth-modal__error">{error}</p>}
              {resetSuccess && <p className="auth-modal__success">{resetSuccess}</p>}

              {!resetSuccess && (
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send reset link'}
                </button>
              )}

              <button
                type="button"
                className="auth-modal__back-link"
                onClick={() => {
                  setFormView('auth')
                  setError(null)
                  setResetSuccess(null)
                }}
              >
                Back to log in
              </button>
            </form>
          </>
        ) : (
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

            {isLogin && (
              <button
                type="button"
                className="auth-modal__forgot-link"
                onClick={() => {
                  setFormView('reset-request')
                  setError(null)
                  setResetSuccess(null)
                }}
              >
                Forgot password?
              </button>
            )}

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
        )}
      </div>
    </div>
  )
}
