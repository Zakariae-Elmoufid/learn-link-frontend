import { apiClient } from '../api-client'
import { StudentDashboardResponse, AdminDashboardStats } from '../types'

export const dashboardService = {
    getStudentDashboard: () =>
        apiClient
            .get<StudentDashboardResponse>('/gamification/dashboard')
            .then((r) => r.data),
    getAdminDashboard: () =>
        apiClient
            .get<AdminDashboardStats>('/admin/dashboard/stats')
            .then((r) => r.data),
}
