import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SideDrawer from '../components/SideDrawer'
import { api, setToken } from '../api'
import type { Assignment, Priority, ProgressUpdate, ProjectDetail, User } from '../api'

type ProgressFilter = 'ALL' | 'DRAFT' | 'PUBLISHED'
type DrawerKind = 'milestone' | 'assign' | null

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function ProjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [siteLeads, setSiteLeads] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [progress, setProgress] = useState<ProgressUpdate[]>([])
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('ALL')
  const [error, setError] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<DrawerKind>(null)
  const [milestoneName, setMilestoneName] = useState('')
  const [phaseName, setPhaseName] = useState('')
  const [assignRole, setAssignRole] = useState<'SITE_LEAD' | 'CLIENT'>('SITE_LEAD')
  const [assignUserId, setAssignUserId] = useState('')

  const filteredProgress = useMemo(() => {
    if (progressFilter === 'ALL') return progress
    return progress.filter((item) => item.status === progressFilter)
  }, [progress, progressFilter])

  const assignOptions = assignRole === 'SITE_LEAD' ? siteLeads : clients

  async function load() {
    try {
      const [detail, leads, clientUsers, updates] = await Promise.all([
        api.getProject(id),
        api.listUsers('SITE_LEAD'),
        api.listUsers('CLIENT'),
        api.listProgress(id),
      ])
      setProject(detail)
      setSiteLeads(leads)
      setClients(clientUsers)
      setProgress(updates)
      setAssignUserId((leads[0] ?? clientUsers[0])?.id ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  async function saveProject(e: FormEvent) {
    e.preventDefault()
    if (!project) return
    setError(null)
    try {
      const updated = await api.updateProject(project.id, {
        name: project.name,
        location: project.location,
        clientDisplayName: project.clientDisplayName,
        priority: project.priority,
        projectValue: project.projectValue,
        strategicNote: project.strategicNote,
      })
      setProject(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function addMilestone(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.addMilestone(id, { name: milestoneName, phaseName: phaseName || undefined })
      setMilestoneName('')
      setPhaseName('')
      setDrawer(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Milestone failed')
    }
  }

  async function assign(e: FormEvent) {
    e.preventDefault()
    if (!assignUserId) {
      setError(`Create a ${assignRole} user first`)
      return
    }
    setError(null)
    try {
      await api.assign(id, { userId: assignUserId, assignmentRole: assignRole })
      setDrawer(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assign failed')
    }
  }

  async function removeAssignment(assignment: Assignment) {
    setError(null)
    try {
      await api.removeAssignment(id, assignment.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed')
    }
  }

  function openAssign(role: 'SITE_LEAD' | 'CLIENT') {
    setAssignRole(role)
    const list = role === 'SITE_LEAD' ? siteLeads : clients
    setAssignUserId(list[0]?.id ?? '')
    setDrawer('assign')
  }

  if (!project) {
    return (
      <main className="shell">
        <p>{error ?? 'Loading…'}</p>
        <Link to="/">Back</Link>
      </main>
    )
  }

  const draftCount = progress.filter((p) => p.status === 'DRAFT').length
  const publishedCount = progress.filter((p) => p.status === 'PUBLISHED').length

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <Link to="/">← Projects</Link>
          <p className="brand-mark">SiteDirect</p>
          <h1>{project.name}</h1>
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

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Project details (Admin-only fields included)</h2>
        <form className="stack" onSubmit={saveProject}>
          <div className="grid two">
            <label>
              Name
              <input
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                required
              />
            </label>
            <label>
              Location
              <input
                value={project.location ?? ''}
                onChange={(e) => setProject({ ...project, location: e.target.value })}
              />
            </label>
            <label>
              Client display name
              <input
                value={project.clientDisplayName ?? ''}
                onChange={(e) => setProject({ ...project, clientDisplayName: e.target.value })}
              />
            </label>
            <label>
              Priority
              <select
                value={project.priority}
                onChange={(e) => setProject({ ...project, priority: e.target.value as Priority })}
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </label>
            <label>
              Project value
              <input
                type="number"
                min="0"
                step="0.01"
                value={project.projectValue ?? ''}
                onChange={(e) =>
                  setProject({
                    ...project,
                    projectValue: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </label>
          </div>
          <label>
            Strategic note
            <textarea
              rows={2}
              value={project.strategicNote ?? ''}
              onChange={(e) => setProject({ ...project, strategicNote: e.target.value })}
            />
          </label>
          <button type="submit">Save project</button>
        </form>
      </section>

      <section className="card">
        <h2>Site Lead activity (internal)</h2>
        <p className="muted">
          Everything the Site Lead logged — drafts and published. Client only sees PUBLISHED via the
          progress link.
        </p>
        <div className="filter-tabs" role="tablist" aria-label="Progress filter">
          <button
            type="button"
            className={progressFilter === 'ALL' ? 'filter-tab is-active' : 'filter-tab'}
            onClick={() => setProgressFilter('ALL')}
          >
            All ({progress.length})
          </button>
          <button
            type="button"
            className={progressFilter === 'DRAFT' ? 'filter-tab is-active' : 'filter-tab'}
            onClick={() => setProgressFilter('DRAFT')}
          >
            Drafts ({draftCount})
          </button>
          <button
            type="button"
            className={progressFilter === 'PUBLISHED' ? 'filter-tab is-active' : 'filter-tab'}
            onClick={() => setProgressFilter('PUBLISHED')}
          >
            Published ({publishedCount})
          </button>
        </div>

        {filteredProgress.length === 0 ? (
          <div className="empty-state">
            <h3>
              {progressFilter === 'ALL'
                ? 'No progress logged yet'
                : progressFilter === 'DRAFT'
                  ? 'No drafts'
                  : 'No published updates'}
            </h3>
            <p className="muted">
              When the Site Lead adds proof on mobile (or via API), it appears here for Admin.
            </p>
          </div>
        ) : (
          <ul className="activity-list">
            {filteredProgress.map((item) => (
              <li key={item.id} className="activity-item">
                <div className="activity-head">
                  <h3>{item.title}</h3>
                  <span
                    className={
                      item.status === 'PUBLISHED' ? 'chip chip--published' : 'chip chip--draft'
                    }
                  >
                    {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </span>
                </div>
                {item.milestoneName && (
                  <p className="activity-milestone">Milestone: {item.milestoneName}</p>
                )}
                {item.note && <p className="activity-note">{item.note}</p>}
                {item.photoUrl && (
                  <p>
                    <a href={item.photoUrl} target="_blank" rel="noreferrer">
                      View photo
                    </a>
                  </p>
                )}
                <div className="activity-meta muted">
                  {item.status === 'PUBLISHED' && item.rating != null && (
                    <span>Rating {item.rating}/5 · </span>
                  )}
                  <span>Created {formatDateTime(item.createdAt)}</span>
                  {item.publishedAt && <span> · Published {formatDateTime(item.publishedAt)}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Progress link (client)</h2>
        <p className="muted">
          Client only sees PUBLISHED via the progress link. Drafts stay internal (this page + Site
          Lead app).
        </p>
        <p>
          Path: <code>{project.progressPath}</code>
        </p>
        <p>
          Token: <code>{project.progressToken}</code>
        </p>
        <p className="muted">Client web: http://localhost:5174{project.progressPath}</p>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Milestones</h2>
          <button type="button" onClick={() => setDrawer('milestone')}>
            Add milestone
          </button>
        </div>
        <ul>
          {project.milestones.map((m) => (
            <li key={m.id}>
              {m.phaseName ? `${m.phaseName} — ` : ''}
              {m.name}
            </li>
          ))}
          {project.milestones.length === 0 && <li className="muted">No milestones yet.</li>}
        </ul>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Assignments</h2>
          <div className="row">
            <button type="button" onClick={() => openAssign('SITE_LEAD')}>
              Assign Site Lead
            </button>
            <button type="button" className="secondary" onClick={() => openAssign('CLIENT')}>
              Assign Client
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>User</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {project.assignments.map((a) => (
              <tr key={a.id}>
                <td>{a.assignmentRole}</td>
                <td>
                  {a.userFullName}
                  <div className="muted">{a.userEmail}</div>
                </td>
                <td>
                  <button className="danger" type="button" onClick={() => void removeAssignment(a)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {project.assignments.length === 0 && (
              <tr>
                <td colSpan={3} className="muted">
                  No assignments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          Need accounts? <Link to="/users/new">Create user</Link>
        </p>
      </section>

      <SideDrawer
        open={drawer === 'milestone'}
        title="Add milestone"
        onClose={() => setDrawer(null)}
      >
        <form className="stack" onSubmit={addMilestone}>
          <label>
            Phase (optional)
            <input value={phaseName} onChange={(e) => setPhaseName(e.target.value)} />
          </label>
          <label>
            Milestone name
            <input
              value={milestoneName}
              onChange={(e) => setMilestoneName(e.target.value)}
              required
              autoFocus
            />
          </label>
          <button type="submit">Save milestone</button>
        </form>
      </SideDrawer>

      <SideDrawer
        open={drawer === 'assign'}
        title={assignRole === 'SITE_LEAD' ? 'Assign Site Lead' : 'Assign Client'}
        onClose={() => setDrawer(null)}
      >
        <form className="stack" onSubmit={assign}>
          {assignOptions.length === 0 ? (
            <p className="muted">
              No {assignRole} users yet. <Link to="/users/new">Create user</Link>
            </p>
          ) : (
            <label>
              User
              <select value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
                {assignOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" disabled={assignOptions.length === 0}>
            Assign
          </button>
        </form>
      </SideDrawer>
    </main>
  )
}
