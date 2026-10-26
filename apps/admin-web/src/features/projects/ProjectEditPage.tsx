import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminChrome from '../../shared/components/AdminChrome'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import PageHeader from '../../shared/components/PageHeader'
import SideDrawer from '../../shared/components/SideDrawer'
import { useRegisterUnsaved } from '../../shared/unsaved/UnsavedChangesContext'
import { usersApi } from '../users/api'
import { projectsApi as api } from './api'
import type { Assignment, Priority, ProjectDetail, User } from '../../shared/types'

type DrawerKind = 'assign' | null

type EditableSnapshot = {
  name: string
  location: string | null
  clientDisplayName: string | null
  priority: Priority
  projectValue: number | null
  strategicNote: string | null
}

function snapshotOf(p: ProjectDetail): EditableSnapshot {
  return {
    name: p.name,
    location: p.location,
    clientDisplayName: p.clientDisplayName,
    priority: p.priority,
    projectValue: p.projectValue,
    strategicNote: p.strategicNote,
  }
}

export default function ProjectEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [baseline, setBaseline] = useState<EditableSnapshot | null>(null)
  const [siteLeads, setSiteLeads] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [drawer, setDrawer] = useState<DrawerKind>(null)
  const [assignRole, setAssignRole] = useState<'SITE_LEAD' | 'CLIENT'>('SITE_LEAD')
  const [assignUserId, setAssignUserId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<Assignment | null>(null)
  const [removing, setRemoving] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [unarchiveOpen, setUnarchiveOpen] = useState(false)
  const [unarchiving, setUnarchiving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const assignOptions = (assignRole === 'SITE_LEAD' ? siteLeads : clients).filter((u) => u.active)

  async function load() {
    try {
      const [detail, leads, clientUsers] = await Promise.all([
        api.getProject(id),
        usersApi.listUsers('SITE_LEAD'),
        usersApi.listUsers('CLIENT'),
      ])
      setProject(detail)
      setBaseline(snapshotOf(detail))
      setSiteLeads(leads)
      setClients(clientUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const dirty = useMemo(() => {
    if (!project || !baseline) return false
    return JSON.stringify(snapshotOf(project)) !== JSON.stringify(baseline)
  }, [project, baseline])
  useRegisterUnsaved(dirty)

  async function saveProject(e: FormEvent) {
    e.preventDefault()
    if (!project || saving) return
    setError(null)
    setSaving(true)
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
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  function openAssign(role: 'SITE_LEAD' | 'CLIENT') {
    setAssignRole(role)
    const list = (role === 'SITE_LEAD' ? siteLeads : clients).filter((u) => u.active)
    setAssignUserId(list[0]?.id ?? '')
    setDrawer('assign')
  }

  async function assign(e: FormEvent) {
    e.preventDefault()
    if (!assignUserId || assigning) {
      if (!assignUserId) setError(`Create a ${assignRole} user first`)
      return
    }
    setError(null)
    setAssigning(true)
    try {
      await api.assign(id, { userId: assignUserId, assignmentRole: assignRole })
      setDrawer(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assign failed')
    } finally {
      setAssigning(false)
    }
  }

  async function confirmRemoveAssignment() {
    if (!pendingRemove || removing) return
    const removedRole = pendingRemove.assignmentRole
    setError(null)
    setNotice(null)
    setRemoving(true)
    try {
      const updated = await api.removeAssignment(id, pendingRemove.id)
      setProject(updated)
      setPendingRemove(null)
      if (removedRole === 'CLIENT') {
        setNotice(
          'Client removed. The old progress link is invalid — copy the new Client link from the project page before sharing again.',
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed')
    } finally {
      setRemoving(false)
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
      navigate(`/projects/${project.id}`)
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
      setNotice('Project restored. Site Leads can see it again on mobile.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed')
    } finally {
      setUnarchiving(false)
    }
  }

  const removeConsequence =
    pendingRemove?.assignmentRole === 'SITE_LEAD' ? (
      <>
        <p>
          Remove <strong>{pendingRemove.userFullName}</strong> as Site Lead?
        </p>
        <p className="muted">
          They lose mobile access to this project. Progress, purchases, and labour stay on the
          project.
        </p>
      </>
    ) : pendingRemove ? (
      <>
        <p>
          Remove <strong>{pendingRemove.userFullName}</strong> as Client?
        </p>
        <p className="muted">
          The public progress link will be rotated immediately. The old URL stops working. You must
          share the new link if you assign another client later.
        </p>
      </>
    ) : null

  if (!project) {
    return (
      <main className="shell">
        <AdminChrome />
        <p>{error ?? 'Loading…'}</p>
        <Link to="/">Back</Link>
      </main>
    )
  }

  return (
    <main className="shell">
      <AdminChrome />
      <PageHeader
        backTo={`/projects/${project.id}`}
        backLabel="← Project"
        title="Edit project"
        subtitle="Update Admin-only fields and assignments"
      />

      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}

      <section className="card">
        <h2>Details</h2>
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
          <div className="row">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? (
                <>
                  <span className="btn-spinner" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save project'
              )}
            </button>
            <Link to={`/projects/${project.id}`} className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Assignments</h2>
          <div className="row">
            <button type="button" className="btn" onClick={() => openAssign('SITE_LEAD')}>
              Assign Site Lead
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => openAssign('CLIENT')}>
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
                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => setPendingRemove(a)}
                  >
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

      <section className="card">
        <h2>Archive</h2>
        {project.archived ? (
          <>
            <p className="muted">
              This project is archived. Site Leads do not see it on mobile. History, progress, and
              bills are kept. Restore to put it back in active Site Lead lists.
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setUnarchiveOpen(true)}
            >
              Restore project
            </button>
          </>
        ) : (
          <>
            <p className="muted">
              Archive hides the project from Site Lead lists. Progress, bills, and labour are kept —
              this is not a hard delete. You can restore it later.
            </p>
            <button type="button" className="btn btn--danger" onClick={() => setArchiveOpen(true)}>
              Archive project
            </button>
          </>
        )}
      </section>

      <SideDrawer
        open={drawer === 'assign'}
        title={assignRole === 'SITE_LEAD' ? 'Assign Site Lead' : 'Assign Client'}
        onClose={() => setDrawer(null)}
      >
        <form className="stack" onSubmit={assign}>
          {assignOptions.length === 0 ? (
            <p className="muted">
              No active {assignRole} users. <Link to="/users/new">Create user</Link>
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
          <button type="submit" className="btn" disabled={assignOptions.length === 0 || assigning}>
            {assigning ? (
              <>
                <span className="btn-spinner" aria-hidden />
                Assigning…
              </>
            ) : (
              'Assign'
            )}
          </button>
        </form>
      </SideDrawer>

      <ConfirmDialog
        open={pendingRemove != null}
        title="Remove assignment"
        body={removeConsequence}
        confirmLabel="Remove assignment"
        loading={removing}
        onCancel={() => !removing && setPendingRemove(null)}
        onConfirm={() => void confirmRemoveAssignment()}
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
              <li>Published client link still works until you remove the Client assignment.</li>
              <li>You can restore the project later from this page.</li>
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
              Assigned Site Leads will see it again on mobile. Archive status is cleared.
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
