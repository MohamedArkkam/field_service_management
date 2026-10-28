import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Attendance, Worker } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function WorkersPage() {
  const { projectId = '' } = useParams()
  const { token } = useAuth()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [workDate, setWorkDate] = useState(todayIso())
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      const [w, a] = await Promise.all([
        api.listWorkers(token, projectId),
        api.listAttendance(token, projectId),
      ])
      setWorkers(w)
      setAttendance(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workers')
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  async function markPresent(worker: Worker) {
    if (!token) return
    if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
      setError('Work date must be YYYY-MM-DD')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.markAttendance(token, projectId, worker.id, workDate)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attendance failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageChrome
      title="Workers"
      subtitle="Daily = charge per day · Monthly = one charge per calendar month"
      backTo={`/projects/${projectId}`}
      backLabel="← Project"
      actions={
        <Link className="btn btn--primary" to={`/projects/${projectId}/workers/new`}>
          Add worker
        </Link>
      }
    >
      <ErrorBox message={error} onRetry={() => void load()} />

      <section className="card stack" style={{ marginBottom: '1rem' }}>
        <h2 className="card-title">Attendance date</h2>
        <label>
          Date
          <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
        </label>
        <p className="muted">Mark present on each worker below.</p>
      </section>

      {loading ? <p className="muted">Loading…</p> : null}
      {!loading && workers.length === 0 ? <p className="muted">No workers yet.</p> : null}

      <ul className="card-list mobile-only">
        {workers.map((item) => (
          <li key={item.id} className="card">
            <h2 className="card-title">{item.fullName}</h2>
            <p className="chip">
              {item.payType} · rate {item.rate}
            </p>
            <button
              type="button"
              className="btn btn--secondary btn--block"
              disabled={busy}
              onClick={() => void markPresent(item)}
            >
              Mark present {workDate}
            </button>
          </li>
        ))}
      </ul>

      {!loading && workers.length > 0 ? (
        <section className="card desktop-only" style={{ marginBottom: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Pay</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.fullName}</strong>
                  </td>
                  <td>
                    {item.payType} · rate {item.rate}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      disabled={busy}
                      onClick={() => void markPresent(item)}
                    >
                      Mark present {workDate}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="stack">
        <h2 className="card-title">Recent attendance</h2>
        {attendance.length === 0 ? (
          <p className="muted">None yet.</p>
        ) : (
          <>
            <ul className="card-list mobile-only">
              {attendance.slice(0, 20).map((a) => (
                <li key={a.id} className="card">
                  <p className="card-title">
                    {a.workerName} · {a.workDate}
                  </p>
                </li>
              ))}
            </ul>
            <section className="card desktop-only">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 20).map((a) => (
                    <tr key={a.id}>
                      <td>{a.workerName}</td>
                      <td>{a.workDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </section>
    </PageChrome>
  )
}
