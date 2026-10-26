type Props = {
  milestoneCount: number
  milestonesWithPublishedProof: number
  publishedUpdateCount: number
  lastPublishedAt?: string | null
  /** Larger layout for project detail */
  size?: 'compact' | 'hero'
}

function formatShortDate(iso: string | null | undefined) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

/**
 * Honest completion from published proof — linear bar only (one visual encoding).
 */
export default function CompletionMeter({
  milestoneCount,
  milestonesWithPublishedProof,
  publishedUpdateCount,
  lastPublishedAt,
  size = 'compact',
}: Props) {
  const last = formatShortDate(lastPublishedAt ?? null)

  if (milestoneCount > 0) {
    const ratio = milestonesWithPublishedProof / milestoneCount
    const pct = Math.round(ratio * 100)

    return (
      <div className={size === 'hero' ? 'completion completion--hero' : 'completion'}>
        <div
          className="completion-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`${milestonesWithPublishedProof} of ${milestoneCount} milestones with published proof`}
        >
          <span className="completion-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="completion-label">
          {milestonesWithPublishedProof}/{milestoneCount} milestones with published proof
        </div>
        <div className="muted">
          {publishedUpdateCount} published
          {last ? ` · last ${last}` : ''}
        </div>
      </div>
    )
  }

  return (
    <div className={size === 'hero' ? 'completion completion--hero' : 'completion'}>
      <div className="completion-label">No milestones yet</div>
      <div className="muted">
        {publishedUpdateCount === 0
          ? 'No published updates'
          : `${publishedUpdateCount} published update${publishedUpdateCount === 1 ? '' : 's'}`}
        {last ? ` · last ${last}` : ''}
      </div>
    </div>
  )
}
