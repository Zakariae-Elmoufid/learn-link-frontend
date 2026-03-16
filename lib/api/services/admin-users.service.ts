import { apiClient } from '../api-client'
import { PageResponse, AdminUserResponse } from '../types'

interface UsersConfig {
    role?: string
    active?: boolean
    search?: string
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: string
}

export const adminUsersService = {
    getUsers: (params: UsersConfig = {}) =>
        apiClient
            .get<PageResponse<AdminUserResponse>>('/admin/users', { params })
            .then((res) => res.data),

    getUserById: (userId: number) =>
        apiClient
            .get<AdminUserResponse>(`/admin/users/${userId}`)
            .then((res) => res.data),

    activateUser: (userId: number) =>
        apiClient
            .patch<AdminUserResponse>(`/admin/users/${userId}/activate`)
            .then((res) => res.data),

    deactivateUser: (userId: number) =>
        apiClient
            .patch<AdminUserResponse>(`/admin/users/${userId}/deactivate`)
            .then((res) => res.data),

    changeUserRole: (userId: number, role: string) =>
        apiClient
            .patch<AdminUserResponse>(`/admin/users/${userId}/role`, undefined, { params: { role } })
            .then((res) => res.data),
}
