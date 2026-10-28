import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { SiteProject } from '../api/types'
import {
  bootstrapSeenIfNeeded,
  isProjectNew,
  markProjectsSeen,
} from '../attention/seenProjects'
import { useAuth } from '../auth/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

export default function ProjectsPage() {
  const { token, user, logout } = useAuth()
  const [projects, setProjects] = useState<SiteProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [seenTick, setSeenTick] = useState(0)

  const load = useCallback(async () => {
    if (!token || !user) return
    setError(null)
    try {
      const list = await api.listProjects(token)
      bootstrapSeenIfNeeded(
        user.id,
        list.map((p) => p.id),
      )
      setProjects(list)
      setSeenTick((n) => n + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [token, user])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  const sorted = useMemo(() => {
    if (!user) return projects
    return [...projects].sort((a, b) => {
      const aNew = isProjectNew(user.id, a.id) ? 0 : 1
      const bNew = isProjectNew(user.id, b.id) ? 0 : 1
      if (aNew !== bNew) return aNew - bNew
      return a.name.localeCompare(b.name)
    })
  }, [projects, user, seenTick])

  const newProjects = useMemo(() => {
    if (!user) return []
    return projects.filter((p) => isProjectNew(user.id, p.id))
  }, [projects, user, seenTick])

  function dismissNewBanner() {
    if (!user || newProjects.length === 0) return
    markProjectsSeen(
      user.id,
      newProjects.map((p) => p.id),
    )
    setSeenTick((n) => n + 1)
  }

  return (
    <PageChrome
      title="My sites"
      subtitle={user?.fullName ?? 'Site Lead'}
      actions={
        <button
          type="button"
          className="btn btn--ghost btn--account"
          onClick={() => setSignOutOpen(true)}
        >
          Sign out
        </button>
      }
    >
      <ErrorBox message={error} onRetry={() => void load()} />

      {!loading && newProjects.length > 0 ? (
        <div className="attention-banner" role="status">
          <p>
            {newProjects.length === 1
              ? '1 new site assignment'
              : `${newProjects.length} new site assignments`}
          </p>
          <button type="button" className="btn btn--ghost btn--account" onClick={dismissNewBanner}>
            Dismiss
          </button>
        </div>
      ) : null}

      {loading ? <p className="muted">Loading…</p> : null}

      {!loading ? (
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          Active sites only. Completed projects are hidden until Admin restores them.
        </p>
      ) : null}

      {!loading && projects.length === 0 ? (
        <p className="muted">No active assigned sites. Ask Admin to assign you or restore a completed project.</p>
      ) : null}

      <ul className="card-list">
        {sorted.map((p) => {
          const isNew = user ? isProjectNew(user.id, p.id) : false
          return (
            <li key={p.id}>
              <Link className="card-link" to={`/projects/${p.id}`}>
                <span className="card-link-head">
                  <span className="card-link-title">{p.name}</span>
                  {isNew ? <span className="badge-new">NEW</span> : null}
                </span>
                <span className="muted">
                  {[p.clientDisplayName, p.location].filter(Boolean).join(' · ') || 'No location'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={signOutOpen}
        title="Sign out?"
        body={<p className="muted">You will need to sign in again to use Site Lead.</p>}
        confirmLabel="Sign out"
        cancelLabel="Stay"
        onCancel={() => setSignOutOpen(false)}
        onConfirm={() => {
          setSignOutOpen(false)
          logout()
        }}
      />
    </PageChrome>
  )
}
