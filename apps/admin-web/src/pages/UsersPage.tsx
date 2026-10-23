import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'
import type { User } from '../api'

export default function UsersPage() {
  const navigate = useNavigate()
  const [siteLeads, setSiteLeads] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.listUsers('SITE_LEAD'), api.listUsers('CLIENT')])
      .then(([leads, clientUsers]) => {
        setSiteLeads(leads)
        setClients(clientUsers)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'))
  }, [])

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <Link to="/">← Projects</Link>
          <p className="brand-mark">SiteDirect</p>
          <h1>Users</h1>
          <p className="muted">Site Lead and Client accounts for assignment</p>
        </div>
        <div className="row">
          <Link to="/users/new" className="button-link">
            Create user
          </Link>
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
      </div>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Site Leads</h2>
        {siteLeads.length === 0 ? (
          <div className="empty-state">
            <h3>None yet</h3>
            <p className="muted">
              <Link to="/users/new">Create a Site Lead</Link> to assign to projects.
            </p>
          </div>
        ) : (
          <ul>
            {siteLeads.map((u) => (
              <li key={u.id}>
                {u.fullName} — {u.email}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Clients</h2>
        {clients.length === 0 ? (
          <div className="empty-state">
            <h3>None yet</h3>
            <p className="muted">
              <Link to="/users/new">Create a Client</Link> for progress-link assignment.
            </p>
          </div>
        ) : (
          <ul>
            {clients.map((u) => (
              <li key={u.id}>
                {u.fullName} — {u.email}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
