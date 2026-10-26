import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminChrome from '../../shared/components/AdminChrome'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import PageHeader from '../../shared/components/PageHeader'
import { usersApi as api } from './api'
import type { User } from '../../shared/types'

type PendingAction = { user: User; kind: 'deactivate' | 'reactivate' }

export default function UsersPage() {
  const [siteLeads, setSiteLeads] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [busy, setBusy] = useState(false)

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

  async function confirmPending() {
    if (!pending || busy) return
    setError(null)
    setBusy(true)
    try {
      if (pending.kind === 'deactivate') {
        await api.deactivateUser(pending.user.id)
        setNotice(`${pending.user.fullName} is inactive and cannot sign in. You can reactivate later.`)
      } else {
        await api.reactivateUser(pending.user.id)
        setNotice(`${pending.user.fullName} can sign in again.`)
      }
      setPending(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  function renderUserList(users: User[]) {
    if (users.length === 0) return null
    return (
      <ul>
        {users.map((u) => (
          <li key={u.id} className="user-row">
            <div className="user-row-meta">
              <span>
                {u.fullName} — {u.email}
              </span>
              {!u.active ? <span className="chip chip--inactive">Inactive</span> : null}
            </div>
            {u.active ? (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => setPending({ user: u, kind: 'deactivate' })}
              >
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => setPending({ user: u, kind: 'reactivate' })}
              >
                Reactivate
              </button>
            )}
          </li>
        ))}
      </ul>
    )
  }

  const isDeactivate = pending?.kind === 'deactivate'

  return (
    <main className="shell shell--wide">
      <AdminChrome active="users" />
      <PageHeader
        backTo="/"
        backLabel="← Projects"
        title="Users"
        subtitle="Site Lead and Client accounts for assignment"
        actions={
          <Link to="/users/new" className="button-link">
            Create user
          </Link>
        }
      />

      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}

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
          renderUserList(siteLeads)
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
          renderUserList(clients)
        )}
      </section>

      <ConfirmDialog
        open={pending != null}
        title={isDeactivate ? 'Deactivate user' : 'Reactivate user'}
        body={
          pending ? (
            isDeactivate ? (
              <>
                <p>
                  Deactivate <strong>{pending.user.fullName}</strong> ({pending.user.email})?
                </p>
                <ul className="confirm-list">
                  <li>They cannot sign in until you reactivate.</li>
                  <li>Project assignments stay until you remove them.</li>
                  <li>This is not a hard delete — you can reactivate later.</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  Reactivate <strong>{pending.user.fullName}</strong> ({pending.user.email})?
                </p>
                <p className="muted">They can sign in again with their existing password.</p>
              </>
            )
          ) : null
        }
        confirmLabel={isDeactivate ? 'Deactivate user' : 'Reactivate user'}
        tone={isDeactivate ? 'danger' : 'primary'}
        loading={busy}
        onCancel={() => !busy && setPending(null)}
        onConfirm={() => void confirmPending()}
      />
    </main>
  )
}
