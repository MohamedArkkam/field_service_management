import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminChrome from '../../shared/components/AdminChrome'
import ClientLinkCell from '../../shared/components/ClientLinkCell'
import CompletionMeter from '../../shared/components/CompletionMeter'
import PageHeader from '../../shared/components/PageHeader'
import { projectsApi as api } from './api'
import type { Priority, ProjectSummary } from '../../shared/types'

const PRIORITY_ORDER: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

function priorityChipClass(priority: Priority) {
  if (priority === 'HIGH') return 'chip chip--priority-high'
  if (priority === 'LOW') return 'chip chip--priority-low'
  return 'chip chip--priority-medium'
}

type PortfolioTab = 'ACTIVE' | 'COMPLETED'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [tab, setTab] = useState<PortfolioTab>('ACTIVE')
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const sortedProjects = useMemo(
    () =>
      [...projects]
        .filter((p) => (tab === 'COMPLETED' ? p.archived : !p.archived))
        .sort((a, b) => {
          const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          if (byPriority !== 0) return byPriority
          return a.name.localeCompare(b.name)
        }),
    [projects, tab],
  )

  const activeCount = useMemo(() => projects.filter((p) => !p.archived).length, [projects])
  const completedCount = useMemo(() => projects.filter((p) => p.archived).length, [projects])

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load projects'))
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(id)
  }, [toast])

  return (
    <main className="shell shell--wide">
      <AdminChrome />
      <PageHeader
        title="Projects"
        subtitle="Portfolio scan · completion from published proof · open a site for Site Lead activity"
        actions={
          <Link to="/projects/new" className="button-link">
            New project
          </Link>
        }
      />

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Projects</h2>
        <div className="filter-tabs" role="tablist" aria-label="Project status">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'ACTIVE'}
            className={tab === 'ACTIVE' ? 'filter-tab is-active' : 'filter-tab'}
            onClick={() => setTab('ACTIVE')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'COMPLETED'}
            className={tab === 'COMPLETED' ? 'filter-tab is-active' : 'filter-tab'}
            onClick={() => setTab('COMPLETED')}
          >
            Completed ({completedCount})
          </button>
        </div>
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          {tab === 'ACTIVE'
            ? 'Sorted by priority (High first). Completion meter = milestones with ≥1 published update. Mark complete on a project page to move it to Completed.'
            : 'Completed projects stay for history. Site Leads do not see them. Restore on the project page to return to Active.'}
        </p>
        {sortedProjects.length === 0 ? (
          <div className="empty-state">
            {tab === 'ACTIVE' ? (
              <>
                <h3>No active projects</h3>
                <p className="muted">
                  <Link to="/projects/new">Create a project</Link>, then assign a Site Lead and share
                  the progress link.
                </p>
              </>
            ) : (
              <>
                <h3>No completed projects</h3>
                <p className="muted">
                  Use <strong>Mark complete</strong> on a project page when a site is finished.
                </p>
              </>
            )}
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
                    <CompletionMeter
                      milestoneCount={p.milestoneCount}
                      milestonesWithPublishedProof={p.milestonesWithPublishedProof}
                      publishedUpdateCount={p.publishedUpdateCount}
                      lastPublishedAt={p.lastPublishedAt}
                    />
                  </td>
                  <td>{p.projectValue ?? '—'}</td>
                  <td>
                    <ClientLinkCell
                      progressPath={p.progressPath}
                      onCopied={() => setToast('Link copied.')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </main>
  )
}
