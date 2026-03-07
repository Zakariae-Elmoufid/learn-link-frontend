'use client'

import { ConversationResponse } from '../../lib/api/types'
import { Avatar } from '../ui'
import { cn } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface ConversationItemProps {
    conversation: ConversationResponse
    isActive: boolean
    onClick: () => void
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
    const formattedTime = conversation.lastMessageAt
        ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })
        : ''

    // Format time to be more compact
    const displayTime = formattedTime
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' days', 'd')
        .replace(' day', 'd')
        .replace('about ', '')
        .replace('less than a minute', 'now')

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            )}
        >          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">

            {
                conversation.participant.profilePictureUrl ? (
                    <img
                        className="h-full w-full object-cover"

                        src={conversation.participant.profilePictureUrl}
                        alt={
                            conversation.participant.firstName && conversation.participant.lastName
                                ? conversation.participant.firstName + " " + conversation.participant.lastName
                                : `User ${conversation.participantId}`
                        }
                    />
                ) : (
                    <Avatar
                        src={conversation.participantAvatar}
                        name={
                            conversation.participant.firstName && conversation.participant.lastName
                                ? conversation.participant.firstName + " " + conversation.participant.lastName
                                : `User ${conversation.participantId}`
                        }
                        size="md"
                        online={undefined}

                    />
                )
            }
        </div>




            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        'font-medium text-sm truncate',
                        isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'
                    )}>
                        {conversation.participant.firstName + " " + conversation.participant.lastName || `User ${conversation.participantId}`}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {displayTime}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-medium text-white bg-primary-600 rounded-full">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    )
}
