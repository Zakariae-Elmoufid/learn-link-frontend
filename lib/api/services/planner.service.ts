import { apiClient } from '../api-client'
import { TaskRequest, TaskResponse } from '../types'

const BASE_URL = '/planner/tasks'

export const plannerService = {
    // ─── CRUD ────────────────────────────────────────────────────────────────

    /** Create a new task */
    create: (data: TaskRequest) =>
        apiClient
            .post<TaskResponse>(BASE_URL, data)
            .then((r) => r.data),

    /** Get a task by ID */
    getById: (taskId: number) =>
        apiClient
            .get<TaskResponse>(`${BASE_URL}/${taskId}`)
            .then((r) => r.data),

    /** Update a task */
    update: (taskId: number, data: TaskRequest) =>
        apiClient
            .put<TaskResponse>(`${BASE_URL}/${taskId}`, data)
            .then((r) => r.data),

    /** Delete a task */
    delete: (taskId: number) =>
        apiClient.delete(`${BASE_URL}/${taskId}`),

    /** Mark task as completed */
    complete: (taskId: number) =>
        apiClient
            .post<TaskResponse>(`${BASE_URL}/${taskId}/complete`)
            .then((r) => r.data),

    // ─── Listing & Discovery ─────────────────────────────────────────────────

    /** Get all tasks for current user */
    getAll: () =>
        apiClient
            .get<TaskResponse[]>(BASE_URL)
            .then((r) => r.data),

    /** Get active tasks (PENDING or IN_PROGRESS) */
    getActive: () =>
        apiClient
            .get<TaskResponse[]>(`${BASE_URL}/active`)
            .then((r) => r.data),

    /** Get today's tasks */
    getToday: () =>
        apiClient
            .get<TaskResponse[]>(`${BASE_URL}/today`)
            .then((r) => r.data),

    /** Get tasks within a date range */
    getRange: (startTime: string, endTime: string) =>
        apiClient
            .get<TaskResponse[]>(`${BASE_URL}/range`, {
                params: { startTime, endTime },
            })
            .then((r) => r.data),

    /** Get overdue tasks */
    getOverdue: () =>
        apiClient
            .get<TaskResponse[]>(`${BASE_URL}/overdue`)
            .then((r) => r.data),
}
