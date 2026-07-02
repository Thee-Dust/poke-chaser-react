import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ResetPasswordPage.css'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const { confirmPasswordReset, openAuthModal } = useAuth()

  const uid = searchParams.get('uid') ?? ''
  const token = searchParams.get('token') ?? ''
  const linkValid = uid !== '' && token !== ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await confirmPasswordReset(uid, token, password)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!linkValid) {
    return (
      <div className="page reset-password-page">
        <div className="page__header">
          <h1>Invalid reset link</h1>
        </div>
        <p className="reset-password-page__text">
          This password reset link is missing required information. Request a new link from the log
          in screen.
        </p>
        <button
          type="button"
          className="btn btn--primary reset-password-page__action"
          onClick={() => openAuthModal('login')}
        >
          Log in
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="page reset-password-page">
        <div className="page__header">
          <h1>Password updated</h1>
        </div>
        <p className="reset-password-page__text">
          Your password has been reset. You can now log in with your new password.
        </p>
        <button
          type="button"
          className="btn btn--primary reset-password-page__action"
          onClick={() => openAuthModal('login')}
        >
          Log in
        </button>
      </div>
    )
  }

  return (
    <div className="page reset-password-page">
      <div className="page__header">
        <h1>Set a new password</h1>
      </div>
      <p className="reset-password-page__text">Choose a new password for your account.</p>

      <form className="reset-password-page__form" onSubmit={handleSubmit} noValidate>
        <label className="reset-password-page__label">
          <span>New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            autoFocus
          />
        </label>

        <label className="reset-password-page__label">
          <span>Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        {error && <p className="reset-password-page__error">{error}</p>}

        <button
          type="submit"
          className="btn btn--primary reset-password-page__action"
          disabled={submitting || password === '' || confirmPassword === ''}
        >
          {submitting ? 'Saving...' : 'Reset password'}
        </button>
      </form>
    </div>
  )
}
