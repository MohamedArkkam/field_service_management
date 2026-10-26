import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Small side panel for short project-scoped creates (milestone / assignment). */
export default function SideDrawer({ open, title, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="drawer-root" role="presentation">
      <button type="button" className="drawer-backdrop" aria-label="Close panel" onClick={onClose} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-header">
          <h2 id="drawer-title">{title}</h2>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}
