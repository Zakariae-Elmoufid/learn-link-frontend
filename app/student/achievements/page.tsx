'use client'

import { useState } from 'react'
import {
    useCurrentUserScore,
    useUserBadges,
    useAllBadges,
    useGlobalLeaderboard,
} from '@/hookes/useGamification'
import {
    MessageCircle,
    Heart,
    BookOpen,
    Lock,
    Trophy,
    Star,
    Zap,
    Target,
    Users,
    Flame,
    Lightbulb,
    Award,
    Check,
} from 'lucide-react'

interface BadgeDetailProps {
    badgeId: number
    code: string
    name: string
    description: string
    iconUrl: string
    type: string
    rarity: string
    pointsRequired: number
    earned: boolean
    earnedAt?: string
}

function getBadgeIcon(code: string, type: string, size: number = 32) {
    const iconProps = { size, strokeWidth: 2 }
    
    // Map badge codes to specific icons
    const codeMap: any = {
        FIRST_POST: <MessageCircle {...iconProps} />,
        HELPFUL_HAND: <Heart {...iconProps} />,
        BOOKWORM: <BookOpen {...iconProps} />,
        SOCIAL_BUTTERFLY: <Users {...iconProps} />,
        TOP_CONTRIBUTOR: <Trophy {...iconProps} />,
        KNOWLEDGE_MASTER: <Lightbulb {...iconProps} />,
        SPEED_LEARNER: <Zap {...iconProps} />,
        GOAL_SETTER: <Target {...iconProps} />,
        ON_FIRE: <Flame {...iconProps} />,
        ACHIEVEMENT_MASTER: <Award {...iconProps} />,
        PERFECT_SCORE: <Check {...iconProps} />,
    }

    if (codeMap[code]) return codeMap[code]

    // Fallback: map by type
    const typeMap: any = {
        ENGAGEMENT: <MessageCircle {...iconProps} />,
        COMMUNITY: <Heart {...iconProps} />,
        LEARNING: <BookOpen {...iconProps} />,
        ACHIEVEMENT: <Trophy {...iconProps} />,
    }

    return typeMap[type] || <Star {...iconProps} />
}

function BadgeCard({ badge }: { badge: BadgeDetailProps }) {
    const getRarityColor = (rarity: string) => {
        const colors: any = {
            COMMON: 'border-gray-300 bg-gray-50',
            UNCOMMON: 'border-green-300 bg-green-50',
            RARE: 'border-blue-300 bg-blue-50',
            EPIC: 'border-purple-300 bg-purple-50',
            LEGENDARY: 'border-yellow-300 bg-yellow-50',
        }
        return colors[rarity] || 'border-gray-300 bg-gray-50'
    }

    const getRarityBadgeColor = (rarity: string) => {
        const colors: any = {
            COMMON: 'bg-gray-100 text-gray-700',
            UNCOMMON: 'bg-green-100 text-green-700',
            RARE: 'bg-blue-100 text-blue-700',
            EPIC: 'bg-purple-100 text-purple-700',
            LEGENDARY: 'bg-yellow-100 text-yellow-700',
        }
        return colors[rarity] || 'bg-gray-100 text-gray-700'
    }

    const getRarityIconColor = (rarity: string) => {
        const colors: any = {
            COMMON: 'text-gray-600',
            UNCOMMON: 'text-green-600',
            RARE: 'text-blue-600',
            EPIC: 'text-purple-600',
            LEGENDARY: 'text-yellow-600',
        }
        return colors[rarity] || 'text-gray-600'
    }

    return (
        <div
            className={`p-4 rounded-lg border-2 ${getRarityColor(badge.rarity)} relative transition-all hover:shadow-lg ${
                !badge.earned ? 'opacity-50' : ''
            }`}
        >
            {!badge.earned && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/10">
                    <Lock size={32} className="text-gray-600" />
                </div>
            )}

            <div className="text-center">
                <div className={`mb-2 flex justify-center ${getRarityIconColor(badge.rarity)}`}>
                    {getBadgeIcon(badge.code, badge.type, 40)}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{badge.name}</h3>
                <p className={`text-xs font-medium px-2 py-1 rounded inline-block ${getRarityBadgeColor(badge.rarity)}`}>
                    {badge.rarity}
                </p>
            </div>

            {badge.earned && badge.earnedAt && (
                <p className="text-xs text-gray-600 text-center mt-2">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
            )}

            {!badge.earned && badge.pointsRequired > 0 && (
                <p className="text-xs text-gray-600 text-center mt-2">
                    Requires {badge.pointsRequired} points
                </p>
            )}
        </div>
    )
}

function LeaderboardSection() {
    const { data: leaderboard } = useGlobalLeaderboard(5)

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Trophy size={24} className="text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
            </div>

            <div className="space-y-3">
                    {leaderboard?.map((entry, idx) => (
                    <div key={entry.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                {entry.rank}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{entry.username}</p>
                                <p className="text-xs text-gray-600">Level {entry.level}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">{entry.totalPoints}</p>
                            <p className="text-xs text-gray-600">{entry.badgeCount} badges</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function BadgesAndAchievementsPage() {
    const { data: userScore } = useCurrentUserScore()
    const { data: userBadges = [] } = useUserBadges(userScore?.userId)
    const { data: allBadges = [] } = useAllBadges()

    const badgesProgress = userBadges.length
    const totalBadges = allBadges.length
    const progressPercentage = totalBadges > 0 ? (badgesProgress / totalBadges) * 100 : 0

    // Create detailed badge list with earned status
    const badgeDetails = allBadges.map((badge) => {
        const earned = userBadges.find((ub) => ub.badgeId === badge.id)
        return {
            badgeId: badge.id,
            code: badge.code,
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl,
            type: badge.type,
            rarity: badge.rarity,
            pointsRequired: badge.pointsRequired,
            earned: !!earned,
            earnedAt: earned?.earnedAt,
        }
    })

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Badges & Achievements</h1>
                    <p className="text-gray-600">Track your learning milestones</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Badges Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                            {/* Progress */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {badgesProgress}/{totalBadges} badges earned
                                </h2>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <p className="text-right text-gray-600 text-sm mt-2">{Math.round(progressPercentage)}%</p>
                            </div>

                            {/* Badge Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {badgeDetails.map((badge) => (
                                    <BadgeCard key={badge.badgeId} badge={badge} />
                                ))}
                            </div>
                        </div>

                        {/* Score Info */}
                        {userScore && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <p className="text-gray-600 text-sm mb-2">Total Points</p>
                                    <p className="text-4xl font-bold text-gray-900">{userScore.totalPoints}</p>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <p className="text-gray-600 text-sm mb-2">Level</p>
                                    <p className="text-4xl font-bold text-blue-600">{userScore.level}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Section */}
                    <div className="lg:col-span-1">
                        <LeaderboardSection />

                        {/* Level Progress */}
                        {userScore && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
                                <h3 className="font-bold text-gray-900 mb-4">Level Progress</h3>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            {userScore.currentLevelPoints} / {userScore.pointsForNextLevel}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {Math.round(userScore.progressPercentage)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${userScore.progressPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Badge Categories */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
                            <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={18} className="text-blue-500" />
                                    <span className="text-sm text-gray-700">Engagement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Heart size={18} className="text-red-500" />
                                    <span className="text-sm text-gray-700">Community</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-green-500" />
                                    <span className="text-sm text-gray-700">Learning</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy size={18} className="text-yellow-500" />
                                    <span className="text-sm text-gray-700">Achievement</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
