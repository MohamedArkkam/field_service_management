import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { PayType } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

export default function NewWorkerPage() {
  const { projectId = '' } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [payType, setPayType] = useState<PayType>('DAILY')
  const [rate, setRate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    const value = Number(rate)
    if (!fullName.trim() || Number.isNaN(value) || value <= 0) {
      setError('Name and a positive rate are required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.createWorker(token, projectId, {
        fullName: fullName.trim(),
        payType,
        rate: value,
      })
      navigate(`/projects/${projectId}/workers`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageChrome
      title="Add worker"
      backTo={`/projects/${projectId}/workers`}
      backLabel="← Workers"
    >
      <form className="card stack" onSubmit={(e) => void onSubmit(e)}>
        <ErrorBox message={error} />
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus />
        </label>
        <label>
          Pay type
          <select value={payType} onChange={(e) => setPayType(e.target.value as PayType)}>
            <option value="DAILY">Daily</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </label>
        <label>
          Rate
          <input
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Saving…' : 'Save worker'}
        </button>
        <Link className="btn btn--ghost btn--block" to={`/projects/${projectId}/workers`}>
          Cancel
        </Link>
      </form>
    </PageChrome>
  )
}
