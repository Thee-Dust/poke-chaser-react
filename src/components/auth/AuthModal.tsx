import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../utils/apiError'
import { isValidUsername, USERNAME_INVALID_MESSAGE } from '../../utils/username'
import './AuthModal.css'

type FormView = 'auth' | 'reset-request'

type FieldErrors = {
  username?: string
  email?: string
  identifier?: string
  password?: string
  confirmPassword?: string
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)

  function clearFieldError(key: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function applyApiError(err: ApiError) {
    const next: FieldErrors = {}
    if (err.fields.username) next.username = err.fields.username
    if (err.fields.email) next.email = err.fields.email
    if (err.fields.identifier) next.identifier = err.fields.identifier
    if (err.fields.password) next.password = err.fields.password
    setFieldErrors(next)

    const hasFieldMessages = Object.keys(next).length > 0
    if (err.fields.non_field_errors || !hasFieldMessages) {
      setError(err.message)
    } else {
      setError(null)
    }
  }

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
      setFieldErrors({ username: USERNAME_INVALID_MESSAGE })
      setError(null)
      return
    }
    if (authModalMode === 'register' && password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match.' })
      setError(null)
      return
    }
    if (authModalMode === 'login') {
      const identifierMissing = email.trim() === ''
      const passwordMissing = password === ''
      if (identifierMissing || passwordMissing) {
        setFieldErrors({
          ...(identifierMissing ? { identifier: 'Required' } : {}),
          ...(passwordMissing ? { password: 'Required' } : {}),
        })
        setError(null)
        return
      }
      setFieldErrors({})
    }
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      if (authModalMode === 'login') {
        await login(email, password)
      } else {
        await register(username, email, password)
      }
      closeAuthModal()
    } catch (err) {
      if (err instanceof ApiError) {
        applyApiError(err)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
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
      if (err instanceof ApiError) {
        applyApiError(err)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
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
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError('email')
                  }}
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={!!resetSuccess}
                  className={fieldErrors.email ? 'auth-modal__input--error' : undefined}
                />
                {fieldErrors.email && (
                  <span className="auth-modal__field-error">{fieldErrors.email}</span>
                )}
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
                  setFieldErrors({})
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
                  onChange={(e) => {
                    setUsername(e.target.value)
                    clearFieldError('username')
                  }}
                  required
                  autoComplete="username"
                  autoFocus
                  className={fieldErrors.username ? 'auth-modal__input--error' : undefined}
                />
                {fieldErrors.username && (
                  <span className="auth-modal__field-error">{fieldErrors.username}</span>
                )}
              </label>
            )}

            <label className="auth-modal__label">
              <span>{isLogin ? 'Email or username' : 'Email'}</span>
              <input
                type={isLogin ? 'text' : 'email'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearFieldError(isLogin ? 'identifier' : 'email')
                }}
                required
                autoComplete={isLogin ? 'username' : 'email'}
                autoFocus={isLogin}
                className={
                  (isLogin ? fieldErrors.identifier : fieldErrors.email)
                    ? 'auth-modal__input--error'
                    : undefined
                }
              />
              {isLogin && fieldErrors.identifier && (
                <span className="auth-modal__field-error">{fieldErrors.identifier}</span>
              )}
              {!isLogin && fieldErrors.email && (
                <span className="auth-modal__field-error">{fieldErrors.email}</span>
              )}
            </label>

            <label className="auth-modal__label">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearFieldError('password')
                }}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className={fieldErrors.password ? 'auth-modal__input--error' : undefined}
              />
              {fieldErrors.password && (
                <span className="auth-modal__field-error">{fieldErrors.password}</span>
              )}
            </label>

            {isLogin && (
              <button
                type="button"
                className="auth-modal__forgot-link"
                onClick={() => {
                  setFormView('reset-request')
                  setError(null)
                  setFieldErrors({})
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    clearFieldError('confirmPassword')
                  }}
                  required
                  autoComplete="new-password"
                  className={
                    fieldErrors.confirmPassword ? 'auth-modal__input--error' : undefined
                  }
                />
                {fieldErrors.confirmPassword && (
                  <span className="auth-modal__field-error">{fieldErrors.confirmPassword}</span>
                )}
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
