import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'
import type { LiabilityOverview } from '../api'

function money(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function LiabilitiesPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<LiabilityOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.liabilities()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <h1>Outstanding liabilities</h1>
          <p className="muted">Unpaid / partial purchases and open labour charges (internal only)</p>
        </div>
        <div className="row">
          <Link to="/">Projects</Link>
          <Link to="/users">Users</Link>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setToken(null)
              navigate('/login')
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <section className="card">
            <h2>Portfolio totals</h2>
            <div className="grid two">
              <p>
                Purchases outstanding
                <br />
                <strong>{money(data.totalPurchaseOutstanding)}</strong>
              </p>
              <p>
                Labour outstanding
                <br />
                <strong>{money(data.totalLabourOutstanding)}</strong>
              </p>
              <p>
                Total outstanding
                <br />
                <strong>{money(data.totalOutstanding)}</strong>
              </p>
            </div>
          </section>

          <section className="card">
            <h2>By project</h2>
            {data.projects.length === 0 ? (
              <p className="muted">No open Unpaid/Partial liabilities.</p>
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
                  {data.projects.map((p) => (
                    <tr key={p.projectId}>
                      <td>
                        <Link to={`/projects/${p.projectId}`}>{p.projectName}</Link>
                      </td>
                      <td>{money(p.purchaseOutstanding)}</td>
                      <td>{money(p.labourOutstanding)}</td>
                      <td>
                        <strong>{money(p.totalOutstanding)}</strong>
                      </td>
                      <td className="muted">
                        {p.openPurchaseCount} purchases · {p.openLabourCount} labour
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
