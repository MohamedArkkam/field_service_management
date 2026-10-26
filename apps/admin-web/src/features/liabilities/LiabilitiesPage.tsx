import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminChrome from '../../shared/components/AdminChrome'
import PageHeader from '../../shared/components/PageHeader'
import { liabilitiesApi as api } from './api'
import type { LiabilityOverview } from '../../shared/types'

function money(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function LiabilitiesPage() {
  const [data, setData] = useState<LiabilityOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .liabilities()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  const projects = useMemo(() => {
    if (!data) return []
    return [...data.projects].sort((a, b) => b.totalOutstanding - a.totalOutstanding)
  }, [data])

  return (
    <main className="shell shell--wide">
      <AdminChrome active="liabilities" />
      <PageHeader
        backTo="/"
        backLabel="← Projects"
        title="Outstanding liabilities"
        subtitle="What do we still owe? Unpaid / Partial purchases and open labour (internal only)"
      />

      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <section className="card">
            <h2>Portfolio totals</h2>
            <div className="chip-legend">
              <span className="muted">Open purchase status:</span>
              <span className="chip chip--unpaid">Unpaid</span>
              <span className="chip chip--partial">Partial</span>
              <span className="muted">· Paid items are settled and hidden here</span>
            </div>
            <div className="stat-grid">
              <div className="stat">
                <span className="stat-label">Purchases outstanding</span>
                <span className="stat-value">{money(data.totalPurchaseOutstanding)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Labour outstanding</span>
                <span className="stat-value">{money(data.totalLabourOutstanding)}</span>
              </div>
              <div className="stat stat--emphasis">
                <span className="stat-label">Total outstanding</span>
                <span className="stat-value">{money(data.totalOutstanding)}</span>
              </div>
            </div>
          </section>

          <section className="card">
            <h2>By project</h2>
            {projects.length === 0 ? (
              <div className="empty-state">
                <h3>No outstanding amounts</h3>
                <p className="muted">
                  When Site Leads log Unpaid or Partial purchases (or open labour), they show up here.
                </p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Purchases</th>
                    <th>Labour</th>
                    <th>Total</th>
                    <th>Open items</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.projectId}>
                      <td>
                        <Link to={`/projects/${p.projectId}`}>{p.projectName}</Link>
                      </td>
                      <td>{money(p.purchaseOutstanding)}</td>
                      <td>{money(p.labourOutstanding)}</td>
                      <td>
                        <strong>{money(p.totalOutstanding)}</strong>
                      </td>
                      <td>
                        <div className="row">
                          {p.openPurchaseCount > 0 && (
                            <span className="chip chip--unpaid">
                              {p.openPurchaseCount} purchase{p.openPurchaseCount === 1 ? '' : 's'}
                            </span>
                          )}
                          {p.openLabourCount > 0 && (
                            <span className="chip chip--draft">{p.openLabourCount} labour</span>
                          )}
                          {p.openPurchaseCount === 0 && p.openLabourCount === 0 && (
                            <span className="muted">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </main>
  )
}
