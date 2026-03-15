import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../lib/api/services/dashboard.service'

const QUERY_KEYS = {
    dashboard: ['dashboard'] as const,
    student: () => [...QUERY_KEYS.dashboard, 'student'] as const,
    admin: () => [...QUERY_KEYS.dashboard, 'admin'] as const,
}

export function useStudentDashboard() {
    return useQuery({
        queryKey: QUERY_KEYS.student(),
        queryFn: () => dashboardService.getStudentDashboard(),
    })
}

export function useAdminDashboard() {
    return useQuery({
        queryKey: QUERY_KEYS.admin(),
        queryFn: () => dashboardService.getAdminDashboard(),
    })
}
