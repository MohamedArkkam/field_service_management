import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'
import type { Priority, ProjectSummary } from '../api'

const PRIORITY_ORDER: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

function priorityChipClass(priority: Priority) {
  if (priority === 'HIGH') return 'chip chip--priority-high'
  if (priority === 'LOW') return 'chip chip--priority-low'
  return 'chip chip--priority-medium'
}

function formatShortDate(iso: string | null) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Honest signal from published proof — never invents a stored % complete. */
function CompletionSignal({ project }: { project: ProjectSummary }) {
  const last = formatShortDate(project.lastPublishedAt)

  if (project.milestoneCount > 0) {
    const ratio = project.milestonesWithPublishedProof / project.milestoneCount
    const pct = Math.round(ratio * 100)
    return (
      <div className="completion">
        <div
          className="completion-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`${project.milestonesWithPublishedProof} of ${project.milestoneCount} milestones with published proof`}
        >
          <span className="completion-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="completion-label">
          {project.milestonesWithPublishedProof}/{project.milestoneCount} milestones with published
          proof
        </div>
        <div className="muted">
          {project.publishedUpdateCount} published
          {last ? ` · last ${last}` : ''}
        </div>
      </div>
    )
  }

  return (
    <div className="completion">
      <div className="completion-label">No milestones yet</div>
      <div className="muted">
        {project.publishedUpdateCount === 0
          ? 'No published updates'
          : `${project.publishedUpdateCount} published update${project.publishedUpdateCount === 1 ? '' : 's'}`}
        {last ? ` · last ${last}` : ''}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [projectValue, setProjectValue] = useState('')
  const [strategicNote, setStrategicNote] = useState('')

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        if (byPriority !== 0) return byPriority
        return a.name.localeCompare(b.name)
      }),
    [projects],
  )

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
          <p className="brand-mark">SiteDirect</p>
          <h1>Projects</h1>
          <p className="muted">
            Portfolio scan · completion from published proof (not a stored %) · open a site for
            drafts + published
          </p>
        </div>
        <div className="row">
          <Link to="/liabilities">Liabilities</Link>
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
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          Sorted by priority (High first). Completion = milestones with ≥1 published update.
        </p>
        {sortedProjects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p className="muted">Create a project above, then assign a Site Lead and share the progress link.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Priority</th>
                <th>Site progress</th>
                <th>Value</th>
                <th>Client link</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/projects/${p.id}`}>{p.name}</Link>
                    <div className="muted">{p.location}</div>
                  </td>
                  <td>
                    <span className={priorityChipClass(p.priority)}>{p.priority}</span>
                  </td>
                  <td>
                    <CompletionSignal project={p} />
                  </td>
                  <td>{p.projectValue ?? '—'}</td>
                  <td>
                    <code>{p.progressPath}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
