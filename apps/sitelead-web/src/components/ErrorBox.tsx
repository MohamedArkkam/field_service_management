type Props = {
  message: string | null
  onRetry?: () => void
}

export default function ErrorBox({ message, onRetry }: Props) {
  if (!message) return null
  return (
    <div className="error-box" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}
