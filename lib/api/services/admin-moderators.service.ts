import { apiClient } from '../api-client'
import {
    ModeratorResponse,
    ModeratorPermissionsResponse,
    CreateModeratorRequest,
    UpdateModeratorPermissionsRequest
} from '../types'

export const adminModeratorsService = {
    getAllModerators: () =>
        apiClient
            .get<ModeratorResponse[]>('/admin/moderators')
            .then((res) => res.data),

    getModeratorById: (userId: number) =>
        apiClient
            .get<ModeratorResponse>(`/admin/moderators/${userId}`)
            .then((res) => res.data),

    getModeratorPermissions: (userId: number) =>
        apiClient
            .get<ModeratorPermissionsResponse>(`/admin/moderators/${userId}/permissions`)
            .then((res) => res.data),

    createModerator: (data: CreateModeratorRequest) =>
        apiClient
            .post<ModeratorResponse>('/admin/moderators', data)
            .then((res) => res.data),

    updateModeratorPermissions: (userId: number, data: UpdateModeratorPermissionsRequest) =>
        apiClient
            .put<ModeratorResponse>(`/admin/moderators/${userId}/permissions`, data)
            .then((res) => res.data),

    removeModerator: (userId: number, reason?: string) =>
        apiClient
            .delete(`/admin/moderators/${userId}`, { params: { reason } })
            .then((res) => res.data),
}
