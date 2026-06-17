import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user, loading, openAuthModal } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal('login')
    }
  }, [loading, user, openAuthModal])

  if (loading) return null

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}
