/** Client progress app origin (Admin never shows full localhost URLs in tables). */
export function clientProgressOrigin(): string {
  const fromEnv = import.meta.env.VITE_CLIENT_WEB_ORIGIN as string | undefined
  return (fromEnv?.replace(/\/$/, '') || 'http://localhost:5174').trim()
}

export function clientProgressUrl(progressPath: string): string {
  const path = progressPath.startsWith('/') ? progressPath : `/${progressPath}`
  return `${clientProgressOrigin()}${path}`
}

/** Short display for tables, e.g. `/p/q9Kx…` */
export function truncateProgressPath(progressPath: string, head = 8): string {
  if (progressPath.length <= head + 1) return progressPath
  return `${progressPath.slice(0, head)}…`
}
