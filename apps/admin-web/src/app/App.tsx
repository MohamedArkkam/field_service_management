import { UnsavedChangesProvider } from '../shared/unsaved/UnsavedChangesContext'
import AppRoutes from './routes'

export default function App() {
  return (
    <UnsavedChangesProvider>
      <AppRoutes />
    </UnsavedChangesProvider>
  )
}
