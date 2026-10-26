import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminChrome from '../../shared/components/AdminChrome'
import PageHeader from '../../shared/components/PageHeader'
import { useRegisterUnsaved } from '../../shared/unsaved/UnsavedChangesContext'
import { projectsApi as api } from './api'
import type { Priority } from '../../shared/types'

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [projectValue, setProjectValue] = useState('')
  const [strategicNote, setStrategicNote] = useState('')
  const [saving, setSaving] = useState(false)

  const dirty = useMemo(
    () =>
      Boolean(name.trim() || location.trim() || projectValue.trim() || strategicNote.trim()) ||
      priority !== 'MEDIUM',
    [name, location, projectValue, strategicNote, priority],
  )
  useRegisterUnsaved(dirty)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    setError(null)
    setSaving(true)
    try {
      const created = await api.createProject({
        name,
        location: location || null,
        priority,
        projectValue: projectValue ? Number(projectValue) : null,
        strategicNote: strategicNote || null,
      })
      navigate(`/projects/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="shell">
      <AdminChrome />
      <PageHeader
        backTo="/"
        backLabel="← Projects"
        title="New project"
        subtitle="One job: set up a site. Priority and value stay Admin-only."
      />

      <section className="card">
        <form className="stack" onSubmit={onCreate}>
          <div className="grid two">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
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
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? (
                <>
                  <span className="btn-spinner" aria-hidden />
                  Creating…
                </>
              ) : (
                'Create project'
              )}
            </button>
            <Link to="/" className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}
