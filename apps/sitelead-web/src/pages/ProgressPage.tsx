import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { ProgressUpdate } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

export default function ProgressPage() {
  const { projectId = '' } = useParams()
  const { token } = useAuth()
  const [items, setItems] = useState<ProgressUpdate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      setItems(await api.listProgress(token, projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  async function publish(item: ProgressUpdate) {
    if (!token) return
    if (!window.confirm(`Publish “${item.title}” for the client progress link?`)) return
    setBusy(true)
    setError(null)
    try {
      await api.publishProgress(token, projectId, item.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  async function deleteDraft(item: ProgressUpdate) {
    if (!token) return
    if (!window.confirm(`Delete draft “${item.title}”? This removes it permanently.`)) return
    setBusy(true)
    setError(null)
    try {
      await api.deleteDraftProgress(token, projectId, item.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageChrome
      title="Progress"
      subtitle="Drafts stay internal until you publish"
      backTo={`/projects/${projectId}`}
      backLabel="← Project"
      actions={
        <Link className="btn btn--primary" to={`/projects/${projectId}/progress/new`}>
          New draft
        </Link>
      }
    >
      <ErrorBox message={error} onRetry={() => void load()} />
      {loading ? <p className="muted">Loading…</p> : null}
      {!loading && items.length === 0 ? <p className="muted">No progress updates yet.</p> : null}

      <ul className="card-list mobile-only">
        {items.map((item) => (
          <li key={item.id} className="card">
            <div className="row-between">
              <h2 className="card-title">{item.title}</h2>
              <span className={item.status === 'PUBLISHED' ? 'chip chip--ok' : 'chip chip--warn'}>
                {item.status}
              </span>
            </div>
            {item.note ? <p className="muted">{item.note}</p> : null}
            {item.photoUrl ? (
              <p>
                <a href={item.photoUrl} target="_blank" rel="noreferrer">
                  View photo
                </a>
              </p>
            ) : null}
            {item.status === 'DRAFT' ? (
              <div className="stack stack--tight">
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  disabled={busy}
                  onClick={() => void publish(item)}
                >
                  Publish
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--block"
                  disabled={busy}
                  onClick={() => void deleteDraft(item)}
                >
                  Delete draft
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {!loading && items.length > 0 ? (
        <section className="card desktop-only">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    {item.photoUrl ? (
                      <div>
                        <a href={item.photoUrl} target="_blank" rel="noreferrer">
                          Photo
                        </a>
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <span
                      className={item.status === 'PUBLISHED' ? 'chip chip--ok' : 'chip chip--warn'}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="muted">{item.note ?? '—'}</td>
                  <td>
                    {item.status === 'DRAFT' ? (
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn--primary"
                          disabled={busy}
                          onClick={() => void publish(item)}
                        >
                          Publish
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger"
                          disabled={busy}
                          onClick={() => void deleteDraft(item)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="muted">Published</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </PageChrome>
  )
}
