import { Link, useNavigate } from 'react-router-dom'
import { setToken } from '../api'

type Props = {
  active?: 'liabilities' | 'users'
}

/** Top bar: brand left · Liabilities / Users / quiet Sign out right */
export default function AdminChrome({ active }: Props) {
  const navigate = useNavigate()

  return (
    <header className="app-header">
      <Link to="/" className="brand-mark app-brand">
        SiteDirect
      </Link>
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
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            setToken(null)
            navigate('/login')
          }}
        >
          Sign out
        </button>
      </nav>
    </header>
  )
}
