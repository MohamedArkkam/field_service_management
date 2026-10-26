import { API_BASE_URL } from '../config'
import type {
  Attendance,
  ProgressUpdate,
  Purchase,
  SiteProject,
  User,
  Worker,
  PayType,
} from './types'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers })
  } catch {
    throw new ApiError(0, `Network error — check API URL (${API_BASE_URL}) and that the phone is on the same Wi‑Fi. Tap Retry.`)
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) => request<User>('/api/auth/me', { token }),

  listProjects: (token: string) =>
    request<SiteProject[]>('/api/site/projects', { token }),

  listProgress: (token: string, projectId: string) =>
    request<ProgressUpdate[]>(`/api/site/projects/${projectId}/progress`, { token }),

  createProgress: (
    token: string,
    projectId: string,
    body: { title: string; note?: string; photoUrl?: string },
  ) =>
    request<ProgressUpdate>(`/api/site/projects/${projectId}/progress`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  publishProgress: (token: string, projectId: string, progressId: string, rating: number) =>
    request<ProgressUpdate>(`/api/site/projects/${projectId}/progress/${progressId}/publish`, {
      method: 'POST',
      token,
      body: JSON.stringify({ rating }),
    }),

  deleteDraftProgress: (token: string, projectId: string, progressId: string) =>
    request<void>(`/api/site/projects/${projectId}/progress/${progressId}`, {
      method: 'DELETE',
      token,
    }),

  listPurchases: (token: string, projectId: string) =>
    request<Purchase[]>(`/api/site/projects/${projectId}/purchases`, { token }),

  createPurchase: (
    token: string,
    projectId: string,
    body: { description: string; vendorName?: string; amount: number; note?: string },
  ) =>
    request<Purchase>(`/api/site/projects/${projectId}/purchases`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  updatePurchasePayment: (token: string, projectId: string, purchaseId: string, amountPaid: number) =>
    request<Purchase>(`/api/site/projects/${projectId}/purchases/${purchaseId}/payment`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ amountPaid }),
    }),

  listWorkers: (token: string, projectId: string) =>
    request<Worker[]>(`/api/site/projects/${projectId}/workers`, { token }),

  createWorker: (
    token: string,
    projectId: string,
    body: { fullName: string; payType: PayType; rate: number },
  ) =>
    request<Worker>(`/api/site/projects/${projectId}/workers`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  listAttendance: (token: string, projectId: string) =>
    request<Attendance[]>(`/api/site/projects/${projectId}/attendance`, { token }),

  markAttendance: (token: string, projectId: string, workerId: string, workDate: string) =>
    request<Attendance>(`/api/site/projects/${projectId}/attendance`, {
      method: 'POST',
      token,
      body: JSON.stringify({ workerId, workDate }),
    }),
}
