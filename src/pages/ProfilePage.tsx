import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isValidUsername, USERNAME_INVALID_MESSAGE } from '../utils/username'
import './ProfilePage.css'

function formatMemberSince(dateJoined?: string): string | null {
  if (!dateJoined) return null
  const date = new Date(dateJoined)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function ProfilePage() {
  const { user, updateProfile, requestPasswordReset } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    setUsername(user.username)
    setEmail(user.email)
    setFirstName(user.first_name ?? '')
    setLastName(user.last_name ?? '')
  }, [user])

  if (!user) {
    return null
  }

  const memberSince = formatMemberSince(user.date_joined)
  const isDirty =
    username !== user.username ||
    email !== user.email ||
    firstName !== (user.first_name ?? '') ||
    lastName !== (user.last_name ?? '')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isDirty) return

    if (!isValidUsername(username)) {
      setError(USERNAME_INVALID_MESSAGE)
      setSuccess(null)
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await updateProfile({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
      })
      setSuccess('Profile updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordReset() {
    if (!user) return

    setPasswordSubmitting(true)
    setPasswordError(null)
    setPasswordMessage(null)
    try {
      const message = await requestPasswordReset(user.email)
      setPasswordMessage(message)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div className="page profile-page">
      <div className="page__header">
        <h1>Profile</h1>
      </div>

      <section className="profile-page__section" aria-labelledby="profile-account-heading">
        <h2 id="profile-account-heading" className="profile-page__section-title">
          Account
        </h2>
        {memberSince && (
          <p className="profile-page__meta">Member since {memberSince}</p>
        )}

        <form className="profile-page__form" onSubmit={handleSubmit} noValidate>
          <label className="profile-page__label">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="profile-page__label">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="profile-page__label">
            <span>First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </label>

          <label className="profile-page__label">
            <span>Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </label>

          {error && <p className="profile-page__error">{error}</p>}
          {success && <p className="profile-page__success">{success}</p>}

          <button
            type="submit"
            className="btn btn--primary profile-page__action"
            disabled={submitting || !isDirty}
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <section className="profile-page__section" aria-labelledby="profile-password-heading">
        <h2 id="profile-password-heading" className="profile-page__section-title">
          Password
        </h2>
        <p className="profile-page__text">
          We&apos;ll email you a link to set a new password.
        </p>

        {passwordError && <p className="profile-page__error">{passwordError}</p>}
        {passwordMessage && <p className="profile-page__success">{passwordMessage}</p>}

        <button
          type="button"
          className="btn btn--danger profile-page__action"
          onClick={handlePasswordReset}
          disabled={passwordSubmitting}
        >
          {passwordSubmitting ? 'Sending...' : 'Change password'}
        </button>
      </section>
    </div>
  )
}
