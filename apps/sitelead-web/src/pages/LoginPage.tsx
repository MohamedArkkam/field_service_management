import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'

export default function LoginPage() {
  const { login, token, loading } = useAuth()
  const [email, setEmail] = useState('sitelead@sitedirect.local')
  const [password, setPassword] = useState('Lead1234!')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && token) {
    return <Navigate to="/" replace />
  }

  async function doLogin() {
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void doLogin()
  }

  return (
    <main className="shell shell--center">
      <p className="brand">SiteDirect</p>
      <h1>Site Lead</h1>
      <p className="muted">Online required · phone-friendly web</p>

      <form className="card stack" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <ErrorBox message={error} onRetry={error ? () => void doLogin() : undefined} />
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
