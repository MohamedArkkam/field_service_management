import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminChrome from '../../shared/components/AdminChrome'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import SideDrawer from '../../shared/components/SideDrawer'
import { projectsApi as api } from './api'
import type { ProgressUpdate, ProjectDetail } from '../../shared/types'
import { MILESTONE_CATALOG, milestonesByPhase } from './milestoneCatalog'

type ProgressFilter = 'ALL' | 'DRAFT' | 'PUBLISHED'

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

function priorityChipClass(priority: string) {
  if (priority === 'HIGH') return 'chip chip--priority-high'
  if (priority === 'LOW') return 'chip chip--priority-low'
  return 'chip chip--priority-medium'
}

export default function ProjectDetailPage() {
  const { id = '' } = useParams()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [progress, setProgress] = useState<ProgressUpdate[]>([])
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('ALL')
  const [error, setError] = useState<string | null>(null)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<Set<string>>(() => new Set())
  const [customName, setCustomName] = useState('')
  const [customPhase, setCustomPhase] = useState('')
  const [savingMilestone, setSavingMilestone] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<ProgressUpdate | null>(null)
  const [deletingDraft, setDeletingDraft] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [unarchiveOpen, setUnarchiveOpen] = useState(false)
  const [unarchiving, setUnarchiving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const filteredProgress = useMemo(() => {
    if (progressFilter === 'ALL') return progress
    return progress.filter((item) => item.status === progressFilter)
  }, [progress, progressFilter])

  const siteLead = project?.assignments.find((a) => a.assignmentRole === 'SITE_LEAD')
  const client = project?.assignments.find((a) => a.assignmentRole === 'CLIENT')

  async function load() {
    try {
      const [detail, updates] = await Promise.all([api.getProject(id), api.listProgress(id)])
      setProject(detail)
      setProgress(updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  useEffect(() => {
    if (!linkOpen) return
    function onDocClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setLinkOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLinkOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [linkOpen])

  const existingMilestoneNames = useMemo(() => {
    const names = new Set<string>()
    for (const m of project?.milestones ?? []) {
      names.add(m.name.trim().toLowerCase())
    }
    return names
  }, [project])

  const catalogGroups = useMemo(() => milestonesByPhase(), [])

  function openMilestoneDrawer() {
    setSelectedMilestoneIds(new Set())
    setCustomName('')
    setCustomPhase('')
    setMilestoneOpen(true)
  }

  function toggleMilestoneId(optionId: string, alreadyOnProject: boolean) {
    if (alreadyOnProject) return
    setSelectedMilestoneIds((prev) => {
      const next = new Set(prev)
      if (next.has(optionId)) next.delete(optionId)
      else next.add(optionId)
      return next
    })
  }

  async function addSelectedMilestones() {
    if (!project || selectedMilestoneIds.size === 0 || savingMilestone) return
    setError(null)
    setSavingMilestone(true)
    try {
      let sortOrder = project.milestones.length
      const toAdd = MILESTONE_CATALOG.filter((m) => selectedMilestoneIds.has(m.id)).filter(
        (m) => !existingMilestoneNames.has(m.name.toLowerCase()),
      )
      for (const m of toAdd) {
        await api.addMilestone(id, {
          name: m.name,
          phaseName: m.phase,
          sortOrder: sortOrder++,
        })
      }
      setSelectedMilestoneIds(new Set())
      setMilestoneOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Milestone failed')
    } finally {
      setSavingMilestone(false)
    }
  }

  async function addCustomMilestone(e: FormEvent) {
    e.preventDefault()
    const name = customName.trim()
    if (!name || savingMilestone) return
    if (existingMilestoneNames.has(name.toLowerCase())) {
      setError('That milestone is already on this project')
      return
    }
    setError(null)
    setSavingMilestone(true)
    try {
      await api.addMilestone(id, {
        name,
        phaseName: customPhase.trim() || undefined,
        sortOrder: project?.milestones.length ?? 0,
      })
      setCustomName('')
      setCustomPhase('')
      setMilestoneOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Milestone failed')
    } finally {
      setSavingMilestone(false)
    }
  }

  async function copyClientUrl() {
    if (!project) return
    const url = `http://localhost:5174${project.progressPath}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  async function confirmDeleteDraft() {
    if (!pendingDraft || deletingDraft) return
    setError(null)
    setDeletingDraft(true)
    try {
      await api.deleteDraftProgress(id, pendingDraft.id)
      setPendingDraft(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingDraft(false)
    }
  }

  async function confirmArchive() {
    if (!project || archiving || project.archived) return
    setError(null)
    setArchiving(true)
    try {
      const updated = await api.archiveProject(project.id)
      setProject(updated)
      setArchiveOpen(false)
      setNotice('Project archived. Site Leads no longer see it on mobile. You can restore it anytime.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Archive failed')
    } finally {
      setArchiving(false)
    }
  }

  async function confirmUnarchive() {
    if (!project || unarchiving || !project.archived) return
    setError(null)
    setUnarchiving(true)
    try {
      const updated = await api.unarchiveProject(project.id)
      setProject(updated)
      setUnarchiveOpen(false)
      setNotice('Project restored. Assigned Site Leads can see it on mobile again.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed')
    } finally {
      setUnarchiving(false)
    }
  }

  if (!project) {
    return (
      <main className="shell">
        <AdminChrome />
        <p>{error ?? 'Loading…'}</p>
        <Link to="/">← Projects</Link>
      </main>
    )
  }

  const draftCount = progress.filter((p) => p.status === 'DRAFT').length
  const publishedCount = progress.filter((p) => p.status === 'PUBLISHED').length
  const clientLocalUrl = `http://localhost:5174${project.progressPath}`

  return (
    <main className="shell">
      <AdminChrome />

      <header className="project-chrome">
        {/* Row 1: back | Edit */}
        <div className="project-chrome-row">
          <Link to="/" className="back-link">
            ← Projects
          </Link>
          <div className="row">
            {project.archived ? (
              <>
                <span className="chip chip--archived">Archived</span>
                <button type="button" className="btn" onClick={() => setUnarchiveOpen(true)}>
                  Restore
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--danger" onClick={() => setArchiveOpen(true)}>
                Archive
              </button>
            )}
            <Link to={`/projects/${project.id}/edit`} className="button-link">
              Edit project
            </Link>
          </div>
        </div>

        {/* Row 2: title | parties (+ client link icon) */}
        <div className="project-chrome-row project-chrome-row--title">
          <h1>{project.name}</h1>
          <div className="project-chrome-parties" aria-label="Assigned parties">
            <p className={siteLead ? 'party-line' : 'party-line is-unassigned'}>
              <span className="party-role">Site Lead</span>
              {' · '}
              {siteLead ? siteLead.userFullName : 'Unassigned'}
            </p>
            <p className={client ? 'party-line' : 'party-line is-unassigned'}>
              <span className="party-role">Client</span>
              {' · '}
              {client ? client.userFullName : 'Unassigned'}
              <span className="party-client-wrap" ref={popoverRef}>
                <button
                  type="button"
                  className="btn party-icon-btn"
                  aria-label="Client progress link"
                  aria-expanded={linkOpen}
                  aria-haspopup="dialog"
                  onClick={() => setLinkOpen((open) => !open)}
                >
                  ↗
                </button>
                {linkOpen ? (
                  <div className="progress-popover" role="dialog" aria-label="Client progress link">
                    <p className="muted">Published updates only — no drafts, bills, or wages.</p>
                    <p className="muted">Path</p>
                    <code>{project.progressPath}</code>
                    <p className="muted">Local client URL</p>
                    <code>{clientLocalUrl}</code>
                    <button type="button" className="btn" onClick={() => void copyClientUrl()}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ) : null}
              </span>
            </p>
          </div>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}

      <section className="card">
        <h2>Project summary</h2>
        <dl className="summary-grid">
          <div className="summary-item">
            <dt>Name</dt>
            <dd>{project.name}</dd>
          </div>
          <div className="summary-item">
            <dt>Location</dt>
            <dd>{project.location || '—'}</dd>
          </div>
          <div className="summary-item">
            <dt>Client display name</dt>
            <dd>{project.clientDisplayName || '—'}</dd>
          </div>
          <div className="summary-item">
            <dt>Priority</dt>
            <dd>
              <span className={priorityChipClass(project.priority)}>{project.priority}</span>
            </dd>
          </div>
          <div className="summary-item">
            <dt>Project value (Admin-only)</dt>
            <dd>{project.projectValue ?? '—'}</dd>
          </div>
          {project.strategicNote ? (
            <div className="summary-item summary-item--full">
              <dt>Strategic note</dt>
              <dd>{project.strategicNote}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="card">
        <h2>Site Lead activity</h2>
        <p className="muted">
          Internal drafts and published updates. Clients only see published items via the progress
          link. Drafts can be deleted; published updates cannot be hard-deleted.
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
                {item.status === 'DRAFT' ? (
                  <div className="row" style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() => setPendingDraft(item)}
                    >
                      Delete draft
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Milestones</h2>
          <button type="button" className="btn" onClick={openMilestoneDrawer}>
            Add milestones
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

      <SideDrawer
        open={milestoneOpen}
        title="Add milestones"
        onClose={() => !savingMilestone && setMilestoneOpen(false)}
      >
        <div className="stack milestone-picker">
          <p className="muted">
            Tick common milestones for this site, or add one custom name. No dates or BOQ — just the
            checklist Site Leads publish against.
          </p>

          {selectedMilestoneIds.size > 0 ? (
            <div className="row">
              <button
                type="button"
                className="btn btn--quiet btn--compact"
                disabled={savingMilestone}
                onClick={() => setSelectedMilestoneIds(new Set())}
              >
                Clear ticks
              </button>
            </div>
          ) : null}

          <div className="milestone-checklist">
            {catalogGroups.map((group) => (
              <fieldset key={group.phase} className="milestone-group">
                <legend>{group.phase}</legend>
                <ul className="milestone-option-list">
                  {group.items.map((opt) => {
                    const already = existingMilestoneNames.has(opt.name.toLowerCase())
                    const checked = already || selectedMilestoneIds.has(opt.id)
                    return (
                      <li key={opt.id}>
                        <label
                          className={
                            already ? 'milestone-option is-existing' : 'milestone-option'
                          }
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={already || savingMilestone}
                            onChange={() => toggleMilestoneId(opt.id, already)}
                          />
                          <span>{opt.name}</span>
                          {already ? <span className="muted">On project</span> : null}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            ))}
          </div>

          <button
            type="button"
            className="btn"
            disabled={savingMilestone || selectedMilestoneIds.size === 0}
            onClick={() => void addSelectedMilestones()}
          >
            {savingMilestone ? (
              <>
                <span className="btn-spinner" aria-hidden />
                Adding…
              </>
            ) : (
              `Add selected (${selectedMilestoneIds.size})`
            )}
          </button>

          <hr className="milestone-divider" />

          <form className="stack" onSubmit={addCustomMilestone}>
            <p className="muted">One-off custom milestone</p>
            <label>
              Phase (optional)
              <input
                value={customPhase}
                onChange={(e) => setCustomPhase(e.target.value)}
                disabled={savingMilestone}
              />
            </label>
            <label>
              Milestone name
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                disabled={savingMilestone}
              />
            </label>
            <button
              type="submit"
              className="btn btn--secondary"
              disabled={savingMilestone || !customName.trim()}
            >
              Add custom
            </button>
          </form>
        </div>
      </SideDrawer>

      <ConfirmDialog
        open={pendingDraft != null}
        title="Delete draft"
        body={
          pendingDraft ? (
            <>
              <p>
                Delete draft <strong>{pendingDraft.title}</strong>?
              </p>
              <p className="muted">Only your team can see drafts. This removes it permanently.</p>
            </>
          ) : null
        }
        confirmLabel="Delete draft"
        loading={deletingDraft}
        onCancel={() => !deletingDraft && setPendingDraft(null)}
        onConfirm={() => void confirmDeleteDraft()}
      />

      <ConfirmDialog
        open={archiveOpen}
        title="Archive project"
        body={
          <>
            <p>
              Archive <strong>{project.name}</strong>?
            </p>
            <ul className="confirm-list">
              <li>Site Leads lose this project from their mobile list.</li>
              <li>Progress, purchases, and labour stay (not deleted).</li>
              <li>You can restore it later from this page or Edit project.</li>
            </ul>
          </>
        }
        confirmLabel="Archive project"
        loading={archiving}
        onCancel={() => !archiving && setArchiveOpen(false)}
        onConfirm={() => void confirmArchive()}
      />

      <ConfirmDialog
        open={unarchiveOpen}
        title="Restore project"
        body={
          <>
            <p>
              Restore <strong>{project.name}</strong> to active?
            </p>
            <p className="muted">
              Assigned Site Leads will see it again on mobile.
            </p>
          </>
        }
        confirmLabel="Restore project"
        tone="primary"
        loading={unarchiving}
        onCancel={() => !unarchiving && setUnarchiveOpen(false)}
        onConfirm={() => void confirmUnarchive()}
      />
    </main>
  )
}
