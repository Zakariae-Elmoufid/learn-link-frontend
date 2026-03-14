import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plannerService } from '@/lib/api/services'
import { TaskRequest, TaskResponse } from '@/lib/api/types'

const QUERY_KEYS = {
    all: ['tasks'] as const,
    lists: () => [...QUERY_KEYS.all, 'list'] as const,
    list: (filter: string) => [...QUERY_KEYS.lists(), filter] as const,
    details: () => [...QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const useTasks = () => {
    return useQuery({
        queryKey: QUERY_KEYS.list('all'),
        queryFn: () => plannerService.getAll(),
    })
}

export const useActiveTasks = () => {
    return useQuery({
        queryKey: QUERY_KEYS.list('active'),
        queryFn: () => plannerService.getActive(),
    })
}

export const useTodayTasks = () => {
    return useQuery({
        queryKey: QUERY_KEYS.list('today'),
        queryFn: () => plannerService.getToday(),
    })
}

export const useTasksInRange = (startTime: string, endTime: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.list(`range-${startTime}-${endTime}`),
        queryFn: () => plannerService.getRange(startTime, endTime),
        enabled: !!startTime && !!endTime,
    })
}

export const useOverdueTasks = () => {
    return useQuery({
        queryKey: QUERY_KEYS.list('overdue'),
        queryFn: () => plannerService.getOverdue(),
    })
}

export const useTask = (taskId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.detail(taskId ?? 0),
        queryFn: () => plannerService.getById(taskId!),
        enabled: !!taskId,
    })
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export const useCreateTask = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: TaskRequest) => plannerService.create(data),
        onSuccess: (newTask) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
            // Add to cache
            queryClient.setQueryData(QUERY_KEYS.detail(newTask.id), newTask)
        },
    })
}

export const useUpdateTask = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: number; data: TaskRequest }) =>
            plannerService.update(taskId, data),
        onSuccess: (updatedTask) => {
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
            // Update cache
            queryClient.setQueryData(QUERY_KEYS.detail(updatedTask.id), updatedTask)
        },
    })
}

export const useDeleteTask = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (taskId: number) => plannerService.delete(taskId),
        onSuccess: (_, taskId) => {
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
            // Remove from cache
            queryClient.removeQueries({ queryKey: QUERY_KEYS.detail(taskId) })
        },
    })
}

export const useCompleteTask = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (taskId: number) => plannerService.complete(taskId),
        onSuccess: (completedTask) => {
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
            // Update cache
            queryClient.setQueryData(QUERY_KEYS.detail(completedTask.id), completedTask)
        },
    })
}
