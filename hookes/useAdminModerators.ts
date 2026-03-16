import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminModeratorsService } from '../lib/api/services/admin-moderators.service'
import { CreateModeratorRequest, UpdateModeratorPermissionsRequest } from '../lib/api/types'
import toast from 'react-hot-toast'

const QUERY_KEYS = {
    moderators: ['admin-moderators'] as const,
    moderator: (id: number) => ['admin-moderator', id] as const,
    moderatorPermissions: (id: number) => ['admin-moderator-permissions', id] as const,
}

export function useAdminModerators() {
    return useQuery({
        queryKey: QUERY_KEYS.moderators,
        queryFn: () => adminModeratorsService.getAllModerators(),
    })
}

export function useAdminModerator(userId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.moderator(userId),
        queryFn: () => adminModeratorsService.getModeratorById(userId),
        enabled: !!userId,
    })
}

export function useAdminModeratorPermissions(userId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.moderatorPermissions(userId),
        queryFn: () => adminModeratorsService.getModeratorPermissions(userId),
        enabled: !!userId,
    })
}

export function useCreateModerator() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (data: CreateModeratorRequest) => adminModeratorsService.createModerator(data),
        onSuccess: () => {
            toast.success('Moderator created successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moderators })
        },
        onError: () => toast.error('Failed to create moderator')
    })
}

export function useUpdateModeratorPermissions() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ userId, data }: { userId: number, data: UpdateModeratorPermissionsRequest }) => adminModeratorsService.updateModeratorPermissions(userId, data),
        onSuccess: (data, { userId }) => {
            toast.success('Permissions updated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moderators })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moderator(userId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moderatorPermissions(userId) })
        },
        onError: () => toast.error('Failed to update permissions')
    })
}

export function useRemoveModerator() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: number, reason?: string }) => adminModeratorsService.removeModerator(userId, reason),
        onSuccess: (data, { userId }) => {
            toast.success('Moderator removed successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moderators })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moderator(userId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moderatorPermissions(userId) })
        },
        onError: () => toast.error('Failed to remove moderator')
    })
}
