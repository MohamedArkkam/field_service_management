import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getToken, setToken } from '../../shared/api/http'
import { authApi as api } from './api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@sitedirect.local')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (getToken()) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.login(email, password)
      if (result.user.role !== 'ADMIN') {
        setToken(null)
        throw new Error('Admin web is for ADMIN users only')
      }
      setToken(result.token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell">
      <div className="card" style={{ maxWidth: 420, margin: '3rem auto' }}>
        <p className="brand-mark">SiteDirect</p>
        <h1>Admin</h1>
        <p className="muted">Admin / Owner only — office portfolio door</p>
        <form className="stack" onSubmit={onSubmit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner" aria-hidden />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
