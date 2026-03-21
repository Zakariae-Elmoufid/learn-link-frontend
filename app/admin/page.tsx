'use client'

import { useAdminDashboard } from '../../hookes'
import { Card } from '../../components/ui'
import { 
    Users, 
    BookOpen, 
    MessageSquare, 
    CheckCircle, 
    TrendingUp, 
    AlertCircle, 
    Activity, 
    Award,
    Network
} from 'lucide-react'

export default function AdminDashboardPage() {
    const { data: stats, isLoading, error } = useAdminDashboard()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    We encountered an error while safely loading the admin statistics. Please ensure you have the appropriate administrative permissions and try again.
                </p>
            </div>
        )
    }

    const {
        totalUsers,
        activeUsersLast7Days,
        newUsersThisMonth,
        totalPosts,
        totalQuestions,
        totalAnswers,
        totalConnections,
        totalPointsAwarded,
        badgesEarned,
        taskCompletionRate,
        topSubjects
    } = stats;

    const summaryCards = [
        { label: 'Total Users', value: totalUsers, sub: `+${newUsersThisMonth} this month`, icon: <Users className="h-6 w-6" />, color: 'bg-blue-500' },
        { label: 'Active (7d)', value: activeUsersLast7Days, sub: `${Math.round((activeUsersLast7Days / totalUsers) * 100)}% of total`, icon: <Activity className="h-6 w-6" />, color: 'bg-green-500' },
        { label: 'Connections', value: totalConnections, sub: 'Active relationships', icon: <Network className="h-6 w-6" />, color: 'bg-indigo-500' },
        { label: 'Total Posts', value: totalPosts, sub: 'Across all subjects', icon: <BookOpen className="h-6 w-6" />, color: 'bg-purple-500' },
    ]

    const engagementCards = [
        { label: 'Total Questions', value: totalQuestions, icon: <MessageSquare className="h-5 w-5" />, color: 'text-amber-500' },
        { label: 'Total Answers', value: totalAnswers, icon: <CheckCircle className="h-5 w-5" />, color: 'text-emerald-500' },
        { label: 'Task Completion', value: `${taskCompletionRate.toFixed(1)}%`, icon: <CheckCircle className="h-5 w-5" />, color: 'text-blue-500' },
    ]

    const gamificationCards = [
        { label: 'Points Awarded', value: totalPointsAwarded.toLocaleString(), icon: <TrendingUp className="h-5 w-5" />, color: 'text-violet-500', bg: 'bg-violet-50' },
        { label: 'Badges Earned', value: badgesEarned.toLocaleString(), icon: <Award className="h-5 w-5" />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    ]

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Platform usage overview and analytics generated at {new Date(stats.generatedAt).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Top Level Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((stat, i) => (
                    <Card key={i} className="p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg border-none ring-1 ring-slate-100 dark:ring-slate-800">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${stat.color}`}></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                    {stat.value.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {stat.sub}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl text-white shadow-sm ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content Engagement */}
                <Card className="col-span-1 lg:col-span-2 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary-500"/>
                        Engagement Metrics
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {engagementCards.map((stat, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                                        {stat.label}
                                    </h4>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white pl-1">
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Most Active Subjects</h4>
                        <div className="space-y-4">
                            {topSubjects.length > 0 ? (() => {
                                const maxCount = Math.max(...topSubjects.map(s => s.count), 1)
                                return topSubjects.map((subject, idx) => {
                                    const percentage = (subject.count / maxCount) * 100
                                    return (
                                        <div key={subject.subject} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                        {subject.subject}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm font-medium">
                                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                        <BookOpen className="w-4 h-4" />
                                                        {subject.count} posts
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 min-w-16">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {subject.count} questions
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })
                            })() : (
                                <p className="text-sm text-slate-500 py-4 text-center">No active subjects to display.</p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Gamification Column */}
                <div className="col-span-1 space-y-6 flex flex-col">
                    <Card className="p-6 flex-1 flex flex-col justify-center border-indigo-100 dark:border-indigo-900">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Award className="h-5 w-5 text-indigo-500" />
                            Reward Economics
                        </h3>
                        
                        <div className="space-y-4">
                            {gamificationCards.map((stat, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border border-transparent ${stat.bg} dark:bg-slate-800/50 dark:border-slate-700`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm ${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {stat.label}
                                        </span>
                                    </div>
                                    <span className={`text-xl font-bold ${stat.color} dark:text-white`}>
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
