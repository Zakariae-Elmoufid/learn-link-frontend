'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    useGroupWithMembers,
    useGroupPendingRequests,
    useJoinGroup,
    useRequestJoinGroup,
    useLeaveGroup,
    useApproveGroupRequest,
    useRejectGroupRequest,
    useRemoveGroupMember,
    useUpdateMemberRole,
    useDeleteGroup,
    useUpdateGroup,
} from '../../../../hookes'
import { Button } from '../../../../components/ui'
import {
    ArrowLeft,
    Users,
    Globe,
    Lock,
    Calendar,
    Settings,
    UserPlus,
    LogOut,
    Trash2,
    Crown,
    Shield,
    User,
    Check,
    X,
    MoreVertical,
    Edit,
    Clock,
} from 'lucide-react'
import { GroupMember, GroupRole } from '../../../../lib/api/types'

export default function GroupDetailPage() {
    const params = useParams()
    const router = useRouter()
    const groupId = Number(params.groupId)

    // UI State
    const [showSettings, setShowSettings] = useState(false)
    const [showMembers, setShowMembers] = useState(true)
    const [memberMenuId, setMemberMenuId] = useState<number | null>(null)

    // Data fetching
    const { data: group, isLoading, error } = useGroupWithMembers(groupId)
    const { data: pendingRequests } = useGroupPendingRequests(
        group?.isAdmin || group?.isOwner ? groupId : null
    )
    // Mutations
    const joinGroup = useJoinGroup()
    const requestJoinGroup = useRequestJoinGroup()
    const leaveGroup = useLeaveGroup()
    const approveRequest = useApproveGroupRequest()
    const rejectRequest = useRejectGroupRequest()
    const removeMember = useRemoveGroupMember()
    const updateRole = useUpdateMemberRole()
    const deleteGroup = useDeleteGroup()

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    <div className="mt-6 space-y-4">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !group) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Group not found
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    The group you're looking for doesn't exist or has been deleted.
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </Button>
            </div>
        )
    }

    const handleJoin = async () => {
        if (group.isPublic) {
            await joinGroup.mutateAsync(groupId)
        } else {
            await requestJoinGroup.mutateAsync(groupId)
        }
    }

    const handleLeave = async () => {
        if (confirm('Are you sure you want to leave this group?')) {
            await leaveGroup.mutateAsync(groupId)
            router.push('/student/groups' as any)
        }
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
            await deleteGroup.mutateAsync(groupId)
            router.push('/student/groups' as any)
        }
    }

    const handleApproveRequest = async (requesterId: number) => {
        await approveRequest.mutateAsync({ groupId, requesterId })
    }

    const handleRejectRequest = async (requesterId: number) => {
        await rejectRequest.mutateAsync({ groupId, requesterId })
    }

    const handleRemoveMember = async (memberId: number) => {
        if (confirm('Are you sure you want to remove this member?')) {
            await removeMember.mutateAsync({ groupId, memberId })
            setMemberMenuId(null)
        }
    }

    const handleUpdateRole = async (memberId: number, role: GroupRole) => {
        await updateRole.mutateAsync({ groupId, memberId, role })
        setMemberMenuId(null)
    }

    const getRoleIcon = (role: GroupRole) => {
        switch (role) {
            case 'OWNER':
                return <Crown className="h-4 w-4 text-amber-500" />
            case 'ADMIN':
                return <Shield className="h-4 w-4 text-blue-500" />
            default:
                return <User className="h-4 w-4 text-slate-400" />
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Groups
            </button>

            {/* Cover Image & Header */}

            <div className="relative rounded-2xl overflow-hidden">
                <div className={`h-48 sm:h-64 ${!group.coverImageUrl ? 'bg-gradient-to-br from-primary-500 to-primary-700' : ''}`}>
                    {group.coverImageUrl && (
                        <Image
                            src={group.coverImageUrl}
                            alt={group.name}
                            fill
                            className="object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Group Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            {/* Visibility Badge */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
                                group.isPublic
                                    ? 'bg-green-500/20 text-green-200'
                                    : 'bg-purple-500/20 text-purple-200'
                            }`}>
                                {group.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                {group.isPublic ? 'Public' : 'Private'}
                            </span>

                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                {group.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    {group.currentMemberCount}/{group.maxMembers} members
                                </span>
                                {group.subjectName && (
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                        {group.subjectName}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    Created {formatDate(group.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {group.isOwner && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-white/10 hover:bg-white/20 text-white"
                                        onClick={() => setShowSettings(true)}
                                    >
                                        <Settings className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                            About this group
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {group.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Pending Requests (Admin/Owner only) */}
                    {(group.isAdmin || group.isOwner) && pendingRequests && pendingRequests.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                    Pending Requests
                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                                        {pendingRequests.length}
                                    </span>
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {pendingRequests.map((request) => (
                                    <div
                                        key={request.userId}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                                                {request.profilePictureUrl ? (
                                                    <Image
                                                        src={request.profilePictureUrl}
                                                        alt={`${request.firstName} ${request.lastName}`}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        {request.firstName?.[0]}{request.lastName?.[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {request.firstName} {request.lastName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleApproveRequest(request.userId)}
                                                loading={approveRequest.isPending}
                                            >
                                                <Check className="h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRejectRequest(request.userId)}
                                                loading={rejectRequest.isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Join/Leave Button */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        {group.isMember ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <Check className="h-5 w-5" />
                                    <span className="font-medium">You're a member</span>
                                </div>
                                {!group.isOwner && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleLeave}
                                        loading={leaveGroup.isPending}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Leave Group
                                    </Button>
                                )}
                            </div>
                        ) : group.hasPendingRequest ? (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">Request pending</span>
                            </div>
                        ) : group.currentMemberCount >= group.maxMembers ? (
                            <div className="text-center text-slate-500 dark:text-slate-400">
                                This group is full
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleJoin}
                                loading={joinGroup.isPending || requestJoinGroup.isPending}
                            >
                                <UserPlus className="h-4 w-4" />
                                {group.isPublic ? 'Join Group' : 'Request to Join'}
                            </Button>
                        )}
                    </div>

                    {/* Owner Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                            Group Owner
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <Crown className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {group.ownerName}
                            </span>
                        </div>
                    </div>

                    {/* Members List */}
                    {group.members && group.members.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Members ({group.currentMemberCount})
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {group.members.slice(0, 10).map((member) => (
                                    <div
                                        key={member.userId}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">

                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {member.firstName} {member.lastName}
                                                    </span>
                                                    {getRoleIcon(member.role)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Member Actions (Admin/Owner only) */}
                                        {(group.isAdmin || group.isOwner) && member.role !== 'OWNER' && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMemberMenuId(
                                                        memberMenuId === member.userId ? null : member.userId
                                                    )}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                </button>

                                                {memberMenuId === member.userId && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setMemberMenuId(null)}
                                                        />
                                                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1">
                                                            {group.isOwner && member.role !== 'ADMIN' && (
                                                                <button
                                                                    onClick={() => handleUpdateRole(member.userId, 'ADMIN')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                >
                                                                    <Shield className="h-4 w-4" />
                                                                    Make Admin
                                                                </button>
                                                            )}
                                                            {group.isOwner && member.role === 'ADMIN' && (
                                                                <button
                                                                    onClick={() => handleUpdateRole(member.userId, 'MEMBER')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                >
                                                                    <User className="h-4 w-4" />
                                                                    Remove Admin
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleRemoveMember(member.userId)}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {group.members.length > 10 && (
                                    <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                                        View all members
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
