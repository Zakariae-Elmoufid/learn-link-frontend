import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersService } from '../lib/api/services/admin-users.service'
import toast from 'react-hot-toast'

const QUERY_KEYS = {
    users: ['admin-users'] as const,
    user: (id: number) => ['admin-user', id] as const,
}

interface UsersParams {
    role?: string
    active?: boolean
    search?: string
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: string
}

export function useAdminUsers(params: UsersParams) {
    return useQuery({
        queryKey: [...QUERY_KEYS.users, params],
        queryFn: () => adminUsersService.getUsers(params),
    })
}

export function useAdminUser(userId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.user(userId),
        queryFn: () => adminUsersService.getUserById(userId),
        enabled: !!userId,
    })
}

export function useActivateUser() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (userId: number) => adminUsersService.activateUser(userId),
        onSuccess: (data, userId) => {
            toast.success('User activated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) })
        },
        onError: () => toast.error('Failed to activate user')
    })
}

export function useDeactivateUser() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (userId: number) => adminUsersService.deactivateUser(userId),
        onSuccess: (data, userId) => {
            toast.success('User deactivated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) })
        },
        onError: () => toast.error('Failed to deactivate user')
    })
}

export function useChangeUserRole() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ userId, role }: { userId: number, role: string }) => adminUsersService.changeUserRole(userId, role),
        onSuccess: (data, { userId }) => {
            toast.success('User role updated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) })
        },
        onError: () => toast.error('Failed to update user role')
    })
}
