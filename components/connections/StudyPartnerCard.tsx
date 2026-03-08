'use client'

import { MatchSuggestion } from '../../lib/api/types'
import { Button } from '../ui'
import { UserPlus, Eye, Clock, Sun, Moon, Users, BookOpen, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface StudyPartnerCardProps {
    partner: MatchSuggestion
    onConnect: (userId: number) => void
    onViewProfile: (userId: number) => void
    isConnecting?: boolean
}

export function StudyPartnerCard({ partner, onConnect, onViewProfile, isConnecting }: StudyPartnerCardProps) {
    const {
        userId,
        firstName,
        lastName,
        profilePictureUrl,
        bio,
        academicLevel,
        compatibilityScore,
        commonSubjects,
        hasPendingRequest,
        isConnected,
    } = partner

    // Get match badge color based on compatibility score
    const getMatchBadgeStyle = (score: number) => {
        if (score >= 90) return 'bg-green-100 text-green-700 border-green-200'
        if (score >= 80) return 'bg-blue-100 text-blue-700 border-blue-200'
        if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }

    // Format academic level
    const formatAcademicLevel = (level: string) => {
        const map: Record<string, string> = {
            HIGH_SCHOOL: 'High School',
            UNDERGRADUATE: 'Undergraduate',
            GRADUATE: 'Graduate',
            POSTGRADUATE: 'Postgraduate',
            PROFESSIONAL: 'Professional',
        }
        return map[level] || level
    }

    const fullName = `${firstName} ${lastName}`

    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600">
            {/* Header background with gradient */}
            <div className="h-20 bg-gradient-to-br from-primary-400 to-primary-600 relative">
                {/* Match badge */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getMatchBadgeStyle(compatibilityScore)}`}>
                    <Sparkles className="h-3 w-3" />
                    {Math.round(compatibilityScore)}% Match
                </div>
            </div>

            {/* Avatar */}
            <div className="relative px-4 -mt-10">
                <div className="relative h-20 w-20 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 overflow-hidden">
                    {profilePictureUrl ? (
                        <img
                            src={profilePictureUrl}
                            alt={fullName}

                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                            {firstName?.charAt(0)}{lastName?.charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pt-3">
                {/* Name & Info */}
                <div className="mb-3">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                        {fullName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatAcademicLevel(academicLevel)}
                    </p>
                </div>

                {/* Bio */}
                {bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                        {bio}
                    </p>
                )}

                {/* Common Subjects */}
                {commonSubjects && commonSubjects.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                            {commonSubjects.slice(0, 3).map((subject) => (
                                <span
                                    key={subject}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                >
                                    {subject}
                                </span>
                            ))}
                            {commonSubjects.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    +{commonSubjects.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewProfile(userId)}
                    >
                        <Eye className="h-4 w-4 mr-1.5" />
                        View Profile
                    </Button>
                    
                    {isConnected ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            disabled
                        >
                            <Users className="h-4 w-4 mr-1.5" />
                            Connected
                        </Button>
                    ) : hasPendingRequest ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            disabled
                        >
                            <Clock className="h-4 w-4 mr-1.5" />
                            Pending
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => onConnect(userId)}
                            loading={isConnecting}
                        >
                            <UserPlus className="h-4 w-4 mr-1.5" />
                            Connect
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

// Loading skeleton
export function StudyPartnerCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
            <div className="h-20 bg-slate-200 dark:bg-slate-700" />
            <div className="px-4 -mt-10">
                <div className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-800 bg-slate-300 dark:bg-slate-600" />
            </div>
            <div className="p-4 pt-3 space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex gap-2">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
                </div>
                <div className="flex gap-2 pt-2">
                    <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
                    <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
                </div>
            </div>
        </div>
    )
}
