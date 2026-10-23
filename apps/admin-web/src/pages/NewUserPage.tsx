import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'
import type { Role } from '../api'

export default function NewUserPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Password123!')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('SITE_LEAD')
  const [saving, setSaving] = useState(false)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.createUser({ email, password, fullName, role })
      navigate('/users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <Link to="/users">← Users</Link>
          <p className="brand-mark">SiteDirect</p>
          <h1>Create user</h1>
          <p className="muted">Site Lead or Client accounts for project assignment.</p>
        </div>
        <button
          className="secondary"
          type="button"
          onClick={() => {
            setToken(null)
            navigate('/login')
          }}
        >
          Sign out
        </button>
      </div>

      <section className="card">
        <form className="stack" onSubmit={onCreate}>
          <div className="grid two">
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus />
            </label>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="SITE_LEAD">SITE_LEAD</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </label>
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
                minLength={8}
                required
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create user'}
            </button>
            <Link to="/users" className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}
