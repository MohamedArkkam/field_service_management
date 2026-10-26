import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import LiabilitiesPage from '../features/liabilities/LiabilitiesPage'
import NewProjectPage from '../features/projects/NewProjectPage'
import ProjectDetailPage from '../features/projects/ProjectDetailPage'
import ProjectEditPage from '../features/projects/ProjectEditPage'
import ProjectsPage from '../features/projects/ProjectsPage'
import NewUserPage from '../features/users/NewUserPage'
import UsersPage from '../features/users/UsersPage'
import RequireAuth from './RequireAuth'

export default function AppRoutes() {
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
        path="/projects/:id/edit"
        element={
          <RequireAuth>
            <ProjectEditPage />
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
