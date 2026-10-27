import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function RequireAuth() {
  const { token, user, loading } = useAuth()

  if (loading) {
    return (
      <main className="shell">
        <p className="muted">Loading…</p>
      </main>
    )
  }

  if (!token || !user || user.role !== 'SITE_LEAD') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
