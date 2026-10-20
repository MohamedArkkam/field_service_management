import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, setToken } from '../api'
import type { Assignment, Priority, ProjectDetail, User } from '../api'

export default function ProjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [siteLeads, setSiteLeads] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [milestoneName, setMilestoneName] = useState('')
  const [phaseName, setPhaseName] = useState('')
  const [siteLeadId, setSiteLeadId] = useState('')
  const [clientId, setClientId] = useState('')

  async function load() {
    try {
      const [detail, leads, clientUsers] = await Promise.all([
        api.getProject(id),
        api.listUsers('SITE_LEAD'),
        api.listUsers('CLIENT'),
      ])
      setProject(detail)
      setSiteLeads(leads)
      setClients(clientUsers)
      setSiteLeadId(leads[0]?.id ?? '')
      setClientId(clientUsers[0]?.id ?? '')
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
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Milestone failed')
    }
  }

  async function assign(role: 'SITE_LEAD' | 'CLIENT', userId: string) {
    if (!userId) {
      setError(`Create a ${role} user first`)
      return
    }
    setError(null)
    try {
      await api.assign(id, { userId, assignmentRole: role })
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

  if (!project) {
    return (
      <main className="shell">
        <p>{error ?? 'Loading…'}</p>
        <Link to="/">Back</Link>
      </main>
    )
  }

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <Link to="/">← Projects</Link>
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
        <h2>Progress link (issued)</h2>
        <p className="muted">Client progress UI comes in M2. Token/path is ready now.</p>
        <p>
          Path: <code>{project.progressPath}</code>
        </p>
        <p>
          Token: <code>{project.progressToken}</code>
        </p>
        <p className="muted">Hint for client-web later: http://localhost:5174{project.progressPath}</p>
      </section>

      <section className="card">
        <h2>Milestones</h2>
        <ul>
          {project.milestones.map((m) => (
            <li key={m.id}>
              {m.phaseName ? `${m.phaseName} — ` : ''}
              {m.name}
            </li>
          ))}
          {project.milestones.length === 0 && <li className="muted">No milestones yet.</li>}
        </ul>
        <form className="stack" onSubmit={addMilestone}>
          <div className="grid two">
            <label>
              Phase (optional)
              <input value={phaseName} onChange={(e) => setPhaseName(e.target.value)} />
            </label>
            <label>
              Milestone name
              <input value={milestoneName} onChange={(e) => setMilestoneName(e.target.value)} required />
            </label>
          </div>
          <button type="submit">Add milestone</button>
        </form>
      </section>

      <section className="card">
        <h2>Assignments</h2>
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
          </tbody>
        </table>
        <div className="grid two" style={{ marginTop: '1rem' }}>
          <div className="stack">
            <label>
              Site Lead
              <select value={siteLeadId} onChange={(e) => setSiteLeadId(e.target.value)}>
                {siteLeads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => void assign('SITE_LEAD', siteLeadId)}>
              Assign Site Lead
            </button>
          </div>
          <div className="stack">
            <label>
              Client
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => void assign('CLIENT', clientId)}>
              Assign Client
            </button>
          </div>
        </div>
        <p className="muted">Create users on the Users page if the lists are empty.</p>
      </section>
    </main>
  )
}
