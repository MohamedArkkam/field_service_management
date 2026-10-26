import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type UnsavedChangesContextValue = {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null)

/** Clears dirty flag on route change so Sign out does not inherit another page's state. */
export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setDirty] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setDirty(false)
  }, [location.pathname])

  const value = useMemo(() => ({ isDirty, setDirty }), [isDirty])

  return (
    <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext)
  if (!ctx) {
    throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider')
  }
  return ctx
}

/** Register whether the current page has unsaved form edits (for Sign out confirm). */
export function useRegisterUnsaved(dirty: boolean) {
  const { setDirty } = useUnsavedChanges()
  useEffect(() => {
    setDirty(dirty)
    return () => setDirty(false)
  }, [dirty, setDirty])
}
