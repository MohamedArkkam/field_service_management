/** v1: local last-seen of site assignments (no push/inbox). */

type SeenMap = Record<string, string>

function storageKey(userId: string) {
  return `sitedirect_sitelead_seen_projects_${userId}`
}

function read(userId: string): SeenMap {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as SeenMap
  } catch {
    return {}
  }
}

function write(userId: string, map: SeenMap) {
  localStorage.setItem(storageKey(userId), JSON.stringify(map))
}

/**
 * First visit for this user: seed current assignments as already seen
 * so existing sites don’t all flash NEW.
 */
export function bootstrapSeenIfNeeded(userId: string, projectIds: string[]) {
  const key = storageKey(userId)
  if (localStorage.getItem(key) != null) return
  const now = new Date().toISOString()
  const map: SeenMap = {}
  for (const id of projectIds) map[id] = now
  write(userId, map)
}

export function isProjectNew(userId: string, projectId: string): boolean {
  return !(projectId in read(userId))
}

export function markProjectSeen(userId: string, projectId: string) {
  const map = read(userId)
  map[projectId] = new Date().toISOString()
  write(userId, map)
}

export function markProjectsSeen(userId: string, projectIds: string[]) {
  const map = read(userId)
  const now = new Date().toISOString()
  for (const id of projectIds) map[id] = now
  write(userId, map)
}
