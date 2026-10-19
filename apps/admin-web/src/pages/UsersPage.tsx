import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'
import type { Role, User } from '../api'

export default function UsersPage() {
  const navigate = useNavigate()
  const [siteLeads, setSiteLeads] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Password123!')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('SITE_LEAD')

  async function load() {
    try {
      const [leads, clientUsers] = await Promise.all([
        api.listUsers('SITE_LEAD'),
        api.listUsers('CLIENT'),
      ])
      setSiteLeads(leads)
      setClients(clientUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.createUser({ email, password, fullName, role })
      setEmail('')
      setFullName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <Link to="/">← Projects</Link>
          <h1>Users</h1>
          <p className="muted">Create Site Lead and Client accounts for project assignment</p>
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
        <h2>Create user</h2>
        <form className="stack" onSubmit={onCreate}>
          <div className="grid two">
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
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
          <button type="submit">Create user</button>
        </form>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Site Leads</h2>
        <ul>
          {siteLeads.map((u) => (
            <li key={u.id}>
              {u.fullName} — {u.email}
            </li>
          ))}
          {siteLeads.length === 0 && <li className="muted">None yet</li>}
        </ul>
      </section>

      <section className="card">
        <h2>Clients</h2>
        <ul>
          {clients.map((u) => (
            <li key={u.id}>
              {u.fullName} — {u.email}
            </li>
          ))}
          {clients.length === 0 && <li className="muted">None yet</li>}
        </ul>
      </section>
    </main>
  )
}
