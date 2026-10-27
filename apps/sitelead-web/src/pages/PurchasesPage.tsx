import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Purchase } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

export default function PurchasesPage() {
  const { projectId = '' } = useParams()
  const { token } = useAuth()
  const [items, setItems] = useState<Purchase[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paidEdits, setPaidEdits] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      const list = await api.listPurchases(token, projectId)
      setItems(list)
      const edits: Record<string, string> = {}
      list.forEach((p) => {
        edits[p.id] = String(p.amountPaid)
      })
      setPaidEdits(edits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  async function savePayment(item: Purchase) {
    if (!token) return
    const paid = Number(paidEdits[item.id] ?? '0')
    if (Number.isNaN(paid) || paid < 0 || paid > item.amount) {
      setError('Amount paid must be between 0 and amount')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.updatePurchasePayment(token, projectId, item.id, paid)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageChrome
      title="Purchases"
      subtitle="Status from amount paid: Unpaid / Partial / Paid"
      backTo={`/projects/${projectId}`}
      backLabel="← Project"
      actions={
        <Link className="btn btn--primary" to={`/projects/${projectId}/purchases/new`}>
          New purchase
        </Link>
      }
    >
      <ErrorBox message={error} onRetry={() => void load()} />
      {loading ? <p className="muted">Loading…</p> : null}
      {!loading && items.length === 0 ? <p className="muted">No purchases yet.</p> : null}

      <ul className="card-list">
        {items.map((item) => (
          <li key={item.id} className="card">
            <div className="row-between">
              <h2 className="card-title">{item.description}</h2>
              <span className="chip">{item.paymentStatus}</span>
            </div>
            <p className="muted">
              Amount {item.amount} · Paid {item.amountPaid} · Outstanding {item.outstanding}
            </p>
            {item.vendorName ? <p className="muted">Vendor: {item.vendorName}</p> : null}
            <label>
              Update amount paid
              <input
                inputMode="decimal"
                value={paidEdits[item.id] ?? ''}
                onChange={(e) => setPaidEdits((prev) => ({ ...prev, [item.id]: e.target.value }))}
              />
            </label>
            <button
              type="button"
              className="btn btn--secondary btn--block"
              disabled={busy}
              onClick={() => void savePayment(item)}
            >
              Save payment
            </button>
          </li>
        ))}
      </ul>
    </PageChrome>
  )
}
