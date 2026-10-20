export type ClientProgressItem = {
  id: string
  title: string
  note: string | null
  photoUrl: string | null
  milestoneName: string | null
  rating: number
  publishedAt: string
}

export type ClientProgress = {
  projectName: string
  clientDisplayName: string | null
  location: string | null
  updates: ClientProgressItem[]
}

export async function fetchProgress(token: string): Promise<ClientProgress> {
  const res = await fetch(`/api/public/p/${encodeURIComponent(token)}`)
  if (!res.ok) {
    let message = `Could not load progress (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return res.json() as Promise<ClientProgress>
}
