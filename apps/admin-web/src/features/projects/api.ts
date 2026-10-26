import { request } from '../../shared/api/http'
import type {
  Assignment,
  Milestone,
  ProgressUpdate,
  ProjectDetail,
  ProjectSummary,
  Role,
} from '../../shared/types'

export const projectsApi = {
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
    request<ProjectDetail>(`/api/projects/${projectId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    }),
  archiveProject: (id: string) =>
    request<ProjectDetail>(`/api/projects/${id}/archive`, { method: 'POST' }),
  unarchiveProject: (id: string) =>
    request<ProjectDetail>(`/api/projects/${id}/unarchive`, { method: 'POST' }),
  deleteDraftProgress: (projectId: string, progressId: string) =>
    request<void>(`/api/projects/${projectId}/progress/${progressId}`, { method: 'DELETE' }),
  progressLink: (id: string) =>
    request<{ token: string; path: string; absoluteHint: string }>(
      `/api/projects/${id}/progress-link`,
    ),
  listProgress: (projectId: string) =>
    request<ProgressUpdate[]>(`/api/projects/${projectId}/progress`),
}
