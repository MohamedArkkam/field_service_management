import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'
import type { Priority, ProjectSummary } from '../api'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [projectValue, setProjectValue] = useState('')
  const [strategicNote, setStrategicNote] = useState('')

  async function load() {
    try {
      setProjects(await api.listProjects())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const created = await api.createProject({
        name,
        location: location || null,
        priority,
        projectValue: projectValue ? Number(projectValue) : null,
        strategicNote: strategicNote || null,
      })
      setName('')
      setLocation('')
      setProjectValue('')
      setStrategicNote('')
      navigate(`/projects/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <h1>Projects</h1>
          <p className="muted">Admin-only priority / value · progress link issued on create</p>
        </div>
        <div className="row">
          <Link to="/users">Users</Link>
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

      <section className="card">
        <h2>Create project</h2>
        <form className="stack" onSubmit={onCreate}>
          <div className="grid two">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Location
              <input value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>
            <label>
              Priority (Admin-only)
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </label>
            <label>
              Project value (Admin-only)
              <input
                value={projectValue}
                onChange={(e) => setProjectValue(e.target.value)}
                type="number"
                min="0"
                step="0.01"
              />
            </label>
          </div>
          <label>
            Strategic note (Admin-only)
            <textarea value={strategicNote} onChange={(e) => setStrategicNote(e.target.value)} rows={2} />
          </label>
          <button type="submit">Create project</button>
        </form>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>All projects</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Priority</th>
              <th>Value</th>
              <th>Progress path</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/projects/${p.id}`}>{p.name}</Link>
                  <div className="muted">{p.location}</div>
                </td>
                <td>
                  <span className="badge">{p.priority}</span>
                </td>
                <td>{p.projectValue ?? '—'}</td>
                <td>
                  <code>{p.progressPath}</code>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  )
}
