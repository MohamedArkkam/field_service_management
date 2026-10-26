import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setToken } from '../api/http'
import { useUnsavedChanges } from '../unsaved/UnsavedChangesContext'
import ConfirmDialog from './ConfirmDialog'

type Props = {
  active?: 'liabilities' | 'users'
}

/** Top bar: brand · nav links · account Sign out (separated, not primary). */
export default function AdminChrome({ active }: Props) {
  const navigate = useNavigate()
  const { isDirty } = useUnsavedChanges()
  const [signOutOpen, setSignOutOpen] = useState(false)

  function signOut() {
    setToken(null)
    navigate('/login')
  }

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand-mark app-brand">
          SiteDirect
        </Link>
        <div className="app-header-end">
          <nav className="app-nav" aria-label="Admin">
            <Link
              to="/liabilities"
              className={active === 'liabilities' ? 'nav-link is-active' : 'nav-link'}
            >
              Liabilities
            </Link>
            <Link to="/users" className={active === 'users' ? 'nav-link is-active' : 'nav-link'}>
              Users
            </Link>
          </nav>
          <span className="app-nav-divider" aria-hidden="true" />
          <button type="button" className="btn btn--ghost" onClick={() => setSignOutOpen(true)}>
            Sign out
          </button>
        </div>
      </header>

      <ConfirmDialog
        open={signOutOpen}
        title={isDirty ? 'Discard and sign out?' : 'Sign out?'}
        body={
          isDirty ? (
            <p className="muted">
              You have unsaved changes on this page. Signing out will discard them.
            </p>
          ) : (
            <p className="muted">You will need to sign in again to use Admin.</p>
          )
        }
        confirmLabel={isDirty ? 'Discard and sign out' : 'Sign out'}
        cancelLabel="Stay"
        tone="primary"
        onCancel={() => setSignOutOpen(false)}
        onConfirm={() => {
          setSignOutOpen(false)
          signOut()
        }}
      />
    </>
  )
}
