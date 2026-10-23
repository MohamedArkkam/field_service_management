import { useEffect, useMemo, useState } from 'react'
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

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        if (byPriority !== 0) return byPriority
        return a.name.localeCompare(b.name)
      }),
    [projects],
  )

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load projects'))
  }, [])

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <p className="brand-mark">SiteDirect</p>
          <h1>Projects</h1>
          <p className="muted">
            Portfolio scan · completion from published proof · open a site for Site Lead activity
          </p>
        </div>
        <div className="row">
          <Link to="/projects/new" className="button-link">
            New project
          </Link>
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

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>All projects</h2>
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          Sorted by priority (High first). Completion = milestones with ≥1 published update.
        </p>
        {sortedProjects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p className="muted">
              <Link to="/projects/new">Create a project</Link>, then assign a Site Lead and share the
              progress link.
            </p>
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
