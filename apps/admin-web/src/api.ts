export type Role = 'ADMIN' | 'SITE_LEAD' | 'CLIENT'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export type User = {
  id: string
  email: string
  fullName: string
  role: Role
}

export type ProjectSummary = {
  id: string
  name: string
  location: string | null
  priority: Priority
  projectValue: number | null
  progressPath: string
  updatedAt: string
}

export type Milestone = {
  id: string
  projectId: string
  phaseName: string | null
  name: string
  sortOrder: number
  createdAt: string
}

export type Assignment = {
  id: string
  projectId: string
  userId: string
  userEmail: string
  userFullName: string
  assignmentRole: Role
}

export type ProjectDetail = {
  id: string
  name: string
  location: string | null
  clientDisplayName: string | null
  priority: Priority
  projectValue: number | null
  strategicNote: string | null
  progressToken: string
  progressPath: string
  createdAt: string
  updatedAt: string
  milestones: Milestone[]
  assignments: Assignment[]
}

const TOKEN_KEY = 'sitedirect_admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
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
  me: () => request<User>('/api/auth/me'),
  listUsers: (role: Role) => request<User[]>(`/api/users?role=${role}`),
  createUser: (body: { email: string; password: string; fullName: string; role: Role }) =>
    request<User>('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  listProjects: () => request<ProjectSummary[]>('/api/projects'),
  getProject: (id: string) => request<ProjectDetail>(`/api/projects/${id}`),
  createProject: (body: Record<string, unknown>) =>
    request<ProjectDetail>('/api/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: string, body: Record<string, unknown>) =>
    request<ProjectDetail>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  addMilestone: (id: string, body: { phaseName?: string; name: string; sortOrder?: number }) =>
    request<Milestone>(`/api/projects/${id}/milestones`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  assign: (id: string, body: { userId: string; assignmentRole: Role }) =>
    request<Assignment>(`/api/projects/${id}/assignments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  removeAssignment: (projectId: string, assignmentId: string) =>
    request<void>(`/api/projects/${projectId}/assignments/${assignmentId}`, { method: 'DELETE' }),
  progressLink: (id: string) =>
    request<{ token: string; path: string; absoluteHint: string }>(
      `/api/projects/${id}/progress-link`,
    ),
}
