import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  /** Account / primary chrome — sits top-right of the title row */
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
    <main className="shell">
      <header className="page-chrome">
        {backTo ? (
          <Link to={backTo} className="back-link">
            {backLabel}
          </Link>
        ) : null}
        <div className="page-chrome-main">
          <div className="page-chrome-text">
            <h1>{title}</h1>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="page-chrome-account">{actions}</div> : null}
        </div>
      </header>
      {children}
    </main>
  )
}
