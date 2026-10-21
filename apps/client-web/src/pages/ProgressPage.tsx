import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProgress } from '../api'
import type { ClientProgress } from '../api'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`Rated ${rating} of 5`}>
      {'★'.repeat(rating)}
      <span className="stars-empty">{'★'.repeat(Math.max(0, 5 - rating))}</span>
    </span>
  )
}

export default function ProgressPage() {
  const { token = '' } = useParams()
  const [data, setData] = useState<ClientProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setData(null)
    fetchProgress(token)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (error) {
    return (
      <main className="page">
        <p className="error">{error}</p>
        <p className="muted">Check the link from your Site Lead or Admin.</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="page">
        <p className="muted">Loading progress…</p>
      </main>
    )
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">SiteDirect progress</p>
        <h1>{data.projectName}</h1>
        {(data.clientDisplayName || data.location) && (
          <p className="sub">
            {[data.clientDisplayName, data.location].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="muted">Approved updates only — no bills or internal costs.</p>
      </header>

      {data.updates.length === 0 ? (
        <section className="empty">
          <h2>No published updates yet</h2>
          <p className="muted">When the Site Lead publishes progress, it will appear here.</p>
        </section>
      ) : (
        <ul className="timeline">
          {data.updates.map((item) => (
            <li key={item.id} className="update">
              <div className="update-head">
                <h2>{item.title}</h2>
                <Stars rating={item.rating} />
              </div>
              {item.milestoneName && <p className="milestone">{item.milestoneName}</p>}
              {item.note && <p className="note">{item.note}</p>}
              {item.photoUrl && (
                <a className="photo-link" href={item.photoUrl} target="_blank" rel="noreferrer">
                  View photo
                </a>
              )}
              <p className="date">{formatDate(item.publishedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
