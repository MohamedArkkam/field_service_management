import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SiteLeadChrome from './SiteLeadChrome'

type Props = {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  /** Primary page actions (e.g. New draft) — not Sign out (that lives in the sticky chrome) */
  actions?: ReactNode
  children: ReactNode
}

export default function PageChrome({
  title,
  subtitle,
  backTo,
  backLabel = '← Back',
  actions,
  children,
}: Props) {
  return (
    <main className="shell shell--wide">
      <SiteLeadChrome />
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
        {actions ? (
          <div className="page-header-aside">
            <div className="page-header-actions">{actions}</div>
          </div>
        ) : null}
      </div>
      {children}
    </main>
  )
}
