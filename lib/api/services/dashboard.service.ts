import { apiClient } from '../api-client'
import { StudentDashboardResponse } from '../types'

export const dashboardService = {
    getStudentDashboard: () =>
        apiClient
            .get<StudentDashboardResponse>('/dashboard')
            .then((r) => r.data),
}
