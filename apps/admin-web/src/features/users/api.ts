import { request } from '../../shared/api/http'
import type { Role, User } from '../../shared/types'

export const usersApi = {
  listUsers: (role: Role) => request<User[]>(`/api/users?role=${role}`),
  createUser: (body: { email: string; password: string; fullName: string; role: Role }) =>
    request<User>('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  deactivateUser: (id: string) =>
    request<User>(`/api/users/${id}/deactivate`, { method: 'POST' }),
  reactivateUser: (id: string) =>
    request<User>(`/api/users/${id}/reactivate`, { method: 'POST' }),
}
