import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { markProjectSeen } from '../attention/seenProjects'
import { useAuth } from '../auth/AuthContext'
import ErrorBox from '../components/ErrorBox'
import PageChrome from '../components/PageChrome'

export default function ProjectHomePage() {
  const { projectId = '' } = useParams()
  const { token, user } = useAuth()
  const [name, setName] = useState('Project')
  const [draftCount, setDraftCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !projectId || !user) return
    markProjectSeen(user.id, projectId)

    void Promise.all([api.listProjects(token), api.listProgress(token, projectId)])
      .then(([list, progress]) => {
        const match = list.find((p) => p.id === projectId)
        if (match) setName(match.name)
        else setError('Project not found or not assigned to you')
        setDraftCount(progress.filter((p) => p.status === 'DRAFT').length)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [token, projectId, user])

  return (
    <PageChrome title={name} subtitle="Site Lead fast path" backTo="/" backLabel="← My sites">
      <ErrorBox message={error} />
      <ul className="card-list">
        <li>
          <Link className="card-link" to={`/projects/${projectId}/progress`}>
            <span className="card-link-head">
              <span className="card-link-title">Progress</span>
              {draftCount > 0 ? (
                <span className="badge-count" aria-label={`${draftCount} drafts`}>
                  {draftCount} draft{draftCount === 1 ? '' : 's'}
                </span>
              ) : null}
            </span>
            <span className="muted">Draft updates → publish for the client link</span>
          </Link>
        </li>
        <li>
          <Link className="card-link" to={`/projects/${projectId}/purchases`}>
            <span className="card-link-title">Purchases</span>
            <span className="muted">Log buys · Unpaid / Partial / Paid</span>
          </Link>
        </li>
        <li>
          <Link className="card-link" to={`/projects/${projectId}/workers`}>
            <span className="card-link-title">Workers & attendance</span>
            <span className="muted">Daily wage or monthly salary · mark present</span>
          </Link>
        </li>
      </ul>
    </PageChrome>
  )
}
