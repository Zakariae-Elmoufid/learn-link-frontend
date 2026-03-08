'use client'

import { useState } from 'react'
import { 
    usePendingRequests, 
    useSentRequests, 
    useAcceptConnectionRequest,
    useRejectConnectionRequest,
    useCancelConnectionRequest,
    usePendingRequestsCount
} from '../../../../hookes'
import { ConnectionRequestResponse } from '../../../../lib/api/types'
import { Button } from '../../../../components/ui'
import { 
    Clock, 
    Check, 
    X, 
    Mail,
    MailOpen,
    Send,
    Inbox,
    Loader2
} from 'lucide-react'
import Image from 'next/image'

type TabType = 'pending' | 'sent'

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
}

// Request Card Component
function RequestCard({ 
    request, 
    type,
    onAccept,
    onReject,
    onCancel,
    isProcessing
}: { 
    request: ConnectionRequestResponse
    type: TabType
    onAccept?: (id: number) => void
    onReject?: (id: number) => void
    onCancel?: (id: number) => void
    isProcessing: boolean
}) {
    if (request.status !== "PENDING") return null

    const isPending = type === 'pending'
    const user = isPending 
        ? {
            id: request.senderId,
            firstName: request.senderFirstName, 
            lastName: request.senderLastName, 
            profilePictureUrl: request.senderProfilePictureUrl 
          }
        : { 
            id: request.receiverId,
            firstName: request.receiverFirstName, 
            lastName: request.receiverLastName, 
            profilePictureUrl: request.receiverProfilePictureUrl 
          }

    const fullName = `${user.firstName} ${user.lastName}`

    return (
        <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            {/* Avatar */}
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                {user.profilePictureUrl ? (
                    <Image
                        src={user.profilePictureUrl}
                        alt={fullName}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-lg font-semibold text-primary-600 bg-primary-100 dark:bg-primary-900/30">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Name and compatibility badge */}
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        {fullName}
                    </h3>
                    {request.compatibilityScore > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            {Math.round(request.compatibilityScore)}% Match
                        </span>
                    )}
                </div>

                {/* Message */}
                {request.message && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        "{request.message}"
                    </p>
                )}

                {/* Status for sent requests */}
                {type === 'sent' && (
                    <div className="mt-2 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            Pending response
                        </span>
                    </div>
                )}
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(request.createdAt)}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {isPending ? (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject?.(request.id)}
                            disabled={isProcessing}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Ignore
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAccept?.(request.id)}
                            disabled={isProcessing}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancel?.(request.id)}
                        disabled={isProcessing}
                        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function ConnectionRequestsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('pending')
    const [processingId, setProcessingId] = useState<number | null>(null)

    // Queries
    const { data: pendingRequests, isLoading: loadingPending } = usePendingRequests()
    const { data: sentRequests, isLoading: loadingSent } = useSentRequests()
    const { data: pendingCount } = usePendingRequestsCount()

    // Mutations
    const acceptRequest = useAcceptConnectionRequest()
    const rejectRequest = useRejectConnectionRequest()
    const cancelRequest = useCancelConnectionRequest()

    const handleAccept = async (requestId: number) => {
        setProcessingId(requestId)
        try {
            await acceptRequest.mutateAsync(requestId)
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (requestId: number) => {
        setProcessingId(requestId)
        try {
            await rejectRequest.mutateAsync(requestId)
        } finally {
            setProcessingId(null)
        }
    }

    const handleCancel = async (requestId: number) => {
        setProcessingId(requestId)
        try {
            await cancelRequest.mutateAsync(requestId)
        } finally {
            setProcessingId(null)
        }
    }

    const isLoading = activeTab === 'pending' ? loadingPending : loadingSent
    const requests = activeTab === 'pending' ? pendingRequests : sentRequests
    const count = pendingCount?.count ?? 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Connection Requests
                    </h1>
                    {count > 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            {count} Pending
                        </span>
                    )}
                </div>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Manage your inbound and outbound invitations to build your study network.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'pending'
                                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Inbox className="h-4 w-4" />
                            Pending Requests
                            {pendingRequests && pendingRequests.length > 0 && (
                                <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'sent'
                                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Sent Requests
                            {sentRequests && sentRequests.length > 0 && (
                                <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {sentRequests.length}
                                </span>
                            )}
                        </div>
                    </button>
                </div>

                {activeTab === 'pending' && pendingRequests && pendingRequests.length > 0 && (
                    <button className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1">
                        <MailOpen className="h-4 w-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            ) : !requests || requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        {activeTab === 'pending' ? (
                            <Inbox className="h-8 w-8 text-slate-400" />
                        ) : (
                            <Send className="h-8 w-8 text-slate-400" />
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {activeTab === 'pending' 
                            ? 'No pending requests' 
                            : 'No sent requests'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        {activeTab === 'pending'
                            ? "You don't have any pending connection requests at the moment."
                            : "You haven't sent any connection requests yet. Find study partners to connect with!"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            type={activeTab}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onCancel={handleCancel}
                            isProcessing={processingId === request.id}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
