'use client'

import { Card } from '../../components/ui'
import { useMyProfile } from '../../hookes'
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
    const { data: profile, isLoading } = useMyProfile()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        )
    }

    const stats = [
        { label: 'Courses Enrolled', value: profile?.postsCount || 0, icon: <BookOpen className="h-6 w-6" />, color: 'bg-blue-500' },
        { label: 'Connections', value: profile?.connectionsCount || 0, icon: <Users className="h-6 w-6" />, color: 'bg-green-500' },
        { label: 'Badges Earned', value: profile?.badgesCount || 0, icon: <Award className="h-6 w-6" />, color: 'bg-yellow-500' },
        { label: 'Total Points', value: profile?.points || 0, icon: <TrendingUp className="h-6 w-6" />, color: 'bg-purple-500' },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Welcome back, {profile?.firstName || 'Student'}! 👋
                </h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Here's what's happening with your learning journey today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} padding="lg">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} rounded-lg p-3 text-white`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                            No recent activity to show
                        </p>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">
                            <BookOpen className="h-6 w-6 text-primary-600" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Browse Courses</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">
                            <Users className="h-6 w-6 text-green-600" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Find Connections</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">
                            <Award className="h-6 w-6 text-yellow-600" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Achievements</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Track Progress</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
