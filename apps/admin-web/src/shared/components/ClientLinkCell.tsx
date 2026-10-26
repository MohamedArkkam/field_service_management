import { truncateProgressPath, clientProgressUrl } from '../lib/clientProgressUrl'

type Props = {
  progressPath: string
  onCopied?: () => void
}

export default function ClientLinkCell({ progressPath, onCopied }: Props) {
  const fullUrl = clientProgressUrl(progressPath)
  const shortPath = truncateProgressPath(progressPath)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl)
      onCopied?.()
    } catch {
      /* ignore — caller may show error elsewhere */
    }
  }

  return (
    <div className="client-link-cell">
      <code className="client-link-path" title={progressPath}>
        {shortPath}
      </code>
      <button type="button" className="btn btn--ghost btn--compact" onClick={() => void copyLink()}>
        Copy
      </button>
      <a
        className="btn btn--ghost btn--compact"
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Open client progress link"
        title="Open"
      >
        ↗
      </a>
    </div>
  )
}
