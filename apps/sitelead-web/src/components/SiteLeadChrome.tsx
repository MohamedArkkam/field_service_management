import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ConfirmDialog from './ConfirmDialog'

/** Sticky forest bar — same costume as Admin chrome on laptop/desktop. */
export default function SiteLeadChrome() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const [signOutOpen, setSignOutOpen] = useState(false)
  const onMySites = location.pathname === '/'

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand-mark app-brand">
            SiteDirect
          </Link>
          <div className="app-header-end">
            <nav className="app-nav" aria-label="Site Lead">
              <Link to="/" className={onMySites ? 'nav-link is-active' : 'nav-link'}>
                My sites
              </Link>
            </nav>
            {user ? (
              <span className="app-header-user muted" title={user.email}>
                {user.fullName}
              </span>
            ) : null}
            <span className="app-nav-divider" aria-hidden="true" />
            <button type="button" className="btn btn--ghost" onClick={() => setSignOutOpen(true)}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={signOutOpen}
        title="Sign out?"
        body={<p className="muted">You will need to sign in again to use Site Lead.</p>}
        confirmLabel="Sign out"
        cancelLabel="Stay"
        onCancel={() => setSignOutOpen(false)}
        onConfirm={() => {
          setSignOutOpen(false)
          logout()
        }}
      />
    </>
  )
}
