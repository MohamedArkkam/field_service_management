import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

export default function NewProgressPage() {
  const { projectId = '' } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token || !title.trim()) {
      setError('Title is required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.createProgress(token, projectId, {
        title: title.trim(),
        note: note.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
      })
      navigate(`/projects/${projectId}/progress`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageChrome
      title="New draft"
      subtitle="Stays internal until you publish from the list"
      backTo={`/projects/${projectId}/progress`}
      backLabel="← Progress"
    >
      <form className="card stack" onSubmit={(e) => void onSubmit(e)}>
        <ErrorBox message={error} />
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>
        <label>
          Note
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
        </label>
        <label>
          Photo URL (optional)
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            inputMode="url"
          />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Saving…' : 'Save draft'}
        </button>
        <Link className="btn btn--ghost btn--block" to={`/projects/${projectId}/progress`}>
          Cancel
        </Link>
      </form>
    </PageChrome>
  )
}
