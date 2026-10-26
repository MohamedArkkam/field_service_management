import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  /** Calm secondary meta (e.g. assigned parties) — not clustered with primary CTA */
  meta?: ReactNode
  /** Primary page actions (e.g. Edit project, New project) */
  actions?: ReactNode
}

/** Title/subtitle left · optional meta + primary actions right (separate from app nav) */
export default function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = '← Back',
  meta,
  actions,
}: Props) {
  const hasAside = meta != null || actions != null

  return (
    <div className="page-header">
      <div className="page-header-text">
        {backTo ? (
          <Link to={backTo} className="back-link">
            {backLabel}
          </Link>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <p className="muted page-subtitle">{subtitle}</p> : null}
      </div>
      {hasAside ? (
        <div className="page-header-aside">
          {meta ? <div className="page-header-meta">{meta}</div> : null}
          {actions ? <div className="page-header-actions">{actions}</div> : null}
        </div>
      ) : null}
    </div>
  )
}
