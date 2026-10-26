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
 * Honest completion from published proof — never invents a stored % when there are no milestones.
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
    const r = size === 'hero' ? 42 : 28
    const c = 2 * Math.PI * r
    const offset = c * (1 - ratio)

    return (
      <div className={size === 'hero' ? 'completion completion--hero' : 'completion'}>
        <div className="completion-visual">
          <svg
            className="completion-ring"
            width={r * 2 + 12}
            height={r * 2 + 12}
            viewBox={`0 0 ${r * 2 + 12} ${r * 2 + 12}`}
            aria-hidden
          >
            <circle
              cx={r + 6}
              cy={r + 6}
              r={r}
              fill="none"
              stroke="var(--draft-bg)"
              strokeWidth="8"
            />
            <circle
              cx={r + 6}
              cy={r + 6}
              r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${r + 6} ${r + 6})`}
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="completion-ring-text"
            >
              {pct}%
            </text>
          </svg>
          <div className="completion-copy">
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
