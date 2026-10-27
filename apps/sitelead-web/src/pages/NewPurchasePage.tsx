import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

export default function NewPurchasePage() {
  const { projectId = '' } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    const value = Number(amount)
    if (!description.trim() || Number.isNaN(value) || value <= 0) {
      setError('Description and a positive amount are required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.createPurchase(token, projectId, {
        description: description.trim(),
        vendorName: vendorName.trim() || undefined,
        amount: value,
        note: note.trim() || undefined,
      })
      navigate(`/projects/${projectId}/purchases`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageChrome
      title="New purchase"
      backTo={`/projects/${projectId}/purchases`}
      backLabel="← Purchases"
    >
      <form className="card stack" onSubmit={(e) => void onSubmit(e)}>
        <ErrorBox message={error} />
        <label>
          Description
          <input value={description} onChange={(e) => setDescription(e.target.value)} required autoFocus />
        </label>
        <label>
          Vendor (optional)
          <input value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
        </label>
        <label>
          Amount
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          Note (optional)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Saving…' : 'Save purchase'}
        </button>
        <Link className="btn btn--ghost btn--block" to={`/projects/${projectId}/purchases`}>
          Cancel
        </Link>
      </form>
    </PageChrome>
  )
}
