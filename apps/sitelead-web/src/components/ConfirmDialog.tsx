import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Stay',
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId()
  const bodyId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="confirm-backdrop" role="presentation" onMouseDown={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        <div id={bodyId} className="confirm-body">
          {body}
        </div>
        <div className="confirm-actions">
          <button ref={cancelRef} type="button" className="btn btn--ghost btn--block" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn--primary btn--block" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
