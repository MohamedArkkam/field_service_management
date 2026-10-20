import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProgressPage from './pages/ProgressPage'

function App() {
  return (
    <Routes>
      <Route path="/p/:token" element={<ProgressPage />} />
      <Route
        path="/"
        element={
          <main className="page">
            <h1>SiteDirect</h1>
            <p className="muted">Open your project progress link: /p/…</p>
          </main>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
