'use client'

import { Card } from '../../components/ui'
import { useMyProfile, useStudentDashboard } from '../../hookes'
import { BookOpen, Users, Award, TrendingUp, MessageSquare, HelpCircle, CheckCircle, Activity, Star } from 'lucide-react'

export default function DashboardPage() {
    const { data: profile, isLoading: isProfileLoading } = useMyProfile()
    const { data: dashboard, isLoading: isDashboardLoading } = useStudentDashboard()

    if (isProfileLoading || isDashboardLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        )
    }

    const dStats = dashboard?.statistics
    const cStats = dashboard?.contentCreationStats
    
    const stats = [
        { label: 'Total Points', value: dStats?.totalPoints || 0, icon: <TrendingUp className="h-6 w-6" />, color: 'bg-purple-500' },
        { label: 'Badges Earned', value: dStats?.totalBadgesEarned || 0, icon: <Award className="h-6 w-6" />, color: 'bg-yellow-500' },
        { label: 'Connections', value: dStats?.activeConnections || 0, icon: <Users className="h-6 w-6" />, color: 'bg-green-500' },
        { label: 'Posts Created', value: dStats?.totalPostsCreated || 0, icon: <BookOpen className="h-6 w-6" />, color: 'bg-blue-500' },
    ]

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date)
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        Welcome back, {profile?.firstName || 'Student'}! 👋
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">
                        Here's your latest academic dashboard. You are currently <span className="text-primary-600 font-bold dark:text-primary-400">Level {dStats?.level || 1}</span>.
                    </p>
                </div>
                {/* Level Progress */}
                {dStats && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 min-w-[250px]">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Level {dStats.level} Progress</span>
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{dStats.currentLevelPoints} / {dStats.pointsForNextLevel} pt</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div 
                                className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (dStats.currentLevelPoints / dStats.pointsForNextLevel) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} padding="lg" className="hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} rounded-xl p-3 text-white shadow-sm`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Content Stats & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Engagement & Content Stats */}
                <Card padding="lg" className="lg:col-span-1 h-full shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary-500" /> 
                        Your Impact
                    </h2>
                    
                    {cStats ? (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Engagement Score</div>
                                <div className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    {cStats.engagementScore} 
                                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
                                    <MessageSquare className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                    <div className="text-xs text-slate-500 mb-1">Answers</div>
                                    <div className="font-bold text-lg dark:text-white">{cStats.totalAnswersProvided}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
                                    <HelpCircle className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                    <div className="text-xs text-slate-500 mb-1">Questions</div>
                                    <div className="font-bold text-lg dark:text-white">{cStats.totalQuestionsAsked}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                                    <div className="text-xs text-slate-500 mb-1">Accepted</div>
                                    <div className="font-bold text-lg dark:text-white">{cStats.totalAnswersAccepted}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
                                    <TrendingUp className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                                    <div className="text-xs text-slate-500 mb-1">Likes Recv</div>
                                    <div className="font-bold text-lg dark:text-white">{cStats.totalPostLikes}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-8">No content stats available yet.</p>
                    )}
                </Card>

                {/* Recent Activity */}
                <Card padding="lg" className="lg:col-span-2 h-full shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" /> 
                        Activity History
                    </h2>
                    
                    <div className="max-h-[380px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
                            dashboard.recentActivities.map((activity, index) => (
                                <div key={index} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                    <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 ring-4 ring-yellow-50 dark:ring-slate-800`}>
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate pr-4">
                                                {activity.title}
                                            </p>
                                            <span className="flex-shrink-0 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                                +{activity.pointsEarned} pts
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                            <span className="capitalize">{activity.type}</span>
                                            <span>{formatDate(activity.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                Your recent activity will appear here as you participate.
                            </p>
                        )}
                    </div>
                </Card>
            </div>
            
        </div>
    )
}
