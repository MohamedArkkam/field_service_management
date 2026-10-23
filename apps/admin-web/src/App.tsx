import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { getToken } from './api'
import LiabilitiesPage from './pages/LiabilitiesPage'
import LoginPage from './pages/LoginPage'
import NewProjectPage from './pages/NewProjectPage'
import NewUserPage from './pages/NewUserPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import UsersPage from './pages/UsersPage'

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <ProjectsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/new"
        element={
          <RequireAuth>
            <NewProjectPage />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <RequireAuth>
            <ProjectDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/users"
        element={
          <RequireAuth>
            <UsersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/users/new"
        element={
          <RequireAuth>
            <NewUserPage />
          </RequireAuth>
        }
      />
      <Route
        path="/liabilities"
        element={
          <RequireAuth>
            <LiabilitiesPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
