import { request } from './http'
import type { Attendance, PayType, ProgressUpdate, Purchase, SiteProject, User, Worker } from './types'

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) => request<User>('/api/auth/me', { token }),

  listProjects: (token: string) => request<SiteProject[]>('/api/site/projects', { token }),

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

  publishProgress: (token: string, projectId: string, progressId: string) =>
    request<ProgressUpdate>(`/api/site/projects/${projectId}/progress/${progressId}/publish`, {
      method: 'POST',
      token,
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
