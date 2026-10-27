import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import RequireAuth from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import NewProgressPage from './pages/NewProgressPage'
import NewPurchasePage from './pages/NewPurchasePage'
import NewWorkerPage from './pages/NewWorkerPage'
import ProgressPage from './pages/ProgressPage'
import ProjectHomePage from './pages/ProjectHomePage'
import ProjectsPage from './pages/ProjectsPage'
import PurchasesPage from './pages/PurchasesPage'
import WorkersPage from './pages/WorkersPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectHomePage />} />
            <Route path="/projects/:projectId/progress" element={<ProgressPage />} />
            <Route path="/projects/:projectId/progress/new" element={<NewProgressPage />} />
            <Route path="/projects/:projectId/purchases" element={<PurchasesPage />} />
            <Route path="/projects/:projectId/purchases/new" element={<NewPurchasePage />} />
            <Route path="/projects/:projectId/workers" element={<WorkersPage />} />
            <Route path="/projects/:projectId/workers/new" element={<NewWorkerPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
