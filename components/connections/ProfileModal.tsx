'use client'

import { useEffect } from 'react'
import { X, Award, MapPin, BookOpen, Sparkles, UserPlus, Clock, Users } from 'lucide-react'
import Image from 'next/image'
import { MatchSuggestion } from '../../lib/api/types'
import { Button } from '../ui'
import { useUserProfile } from '../../hookes'

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    partner: MatchSuggestion | null
    onConnect?: (userId: number) => void
    isConnecting?: boolean
}

export function ProfileModal({ isOpen, onClose, partner, onConnect, isConnecting }: ProfileModalProps) {
    const { data: userProfile, isLoading } = useUserProfile(isOpen && partner ? partner.userId : undefined)

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            window.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen || !partner) return null

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

    const fullName = `${firstName} ${lastName}`

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    {/* Compatibility Badge */}
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold border bg-white/10 text-white border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        {Math.round(compatibilityScore)}% Match
                    </div>
                </div>

                <div className="px-6 pb-6 lg:px-8 lg:pb-8">
                    {/* Avatar */}
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 overflow-hidden shadow-lg">
                            {profilePictureUrl ? (
                                <Image
                                    src={profilePictureUrl}
                                    alt={fullName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-3xl font-bold">
                                    {firstName?.charAt(0)}{lastName?.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Connect Actions */}
                        <div className="flex gap-2 mb-2">
                            {isConnected ? (
                                <Button variant="secondary" disabled>
                                    <Users className="h-4 w-4 mr-2" />
                                    Connected
                                </Button>
                            ) : hasPendingRequest ? (
                                <Button variant="secondary" disabled>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Pending Request
                                </Button>
                            ) : onConnect ? (
                                <Button
                                    variant="primary"
                                    onClick={() => onConnect(userId)}
                                    loading={isConnecting}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Connect
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {fullName}
                                {userProfile?.level && (
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        Lv. {userProfile.level}
                                    </span>
                                )}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {formatAcademicLevel(academicLevel)}
                            </p>
                        </div>

                        {/* Bio */}
                        {bio && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">About</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {bio}
                                </p>
                            </div>
                        )}

                        {/* Gamification Stats */}
                        {isLoading ? (
                            <div className="h-20 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
                        ) : userProfile ? (
                            <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                <div className="text-center">
                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Rank</div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">#{userProfile.rank}</div>
                                </div>
                                <div className="text-center border-l border-r border-slate-200 dark:border-slate-700">
                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Points</div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{userProfile.totalPoints}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Badges</div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{userProfile.badgeCount}</div>
                                </div>
                            </div>
                        ) : null}

                        {/* Badges */}
                        {userProfile?.badges && userProfile.badges.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-primary-500" />
                                    Earned Badges
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {userProfile.badges.map((badge) => (
                                        <div
                                            key={badge.badgeId}
                                            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-20 text-center"
                                            title={badge.name}
                                        >
                                            {badge.iconUrl ? (
                                                <Image src={badge.iconUrl} alt={badge.name} width={32} height={32} className="mb-1" />
                                            ) : (
                                                <Award className="h-8 w-8 text-primary-400 mb-1" />
                                            )}
                                            <span className="text-[10px] font-medium leading-tight text-slate-600 dark:text-slate-300 line-clamp-2">
                                                {badge.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Common Subjects */}
                        {commonSubjects && commonSubjects.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                    Common Subjects
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {commonSubjects.map((subject) => (
                                        <span
                                            key={subject}
                                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
