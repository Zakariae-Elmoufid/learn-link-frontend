'use client'

import { useRef, useEffect } from 'react'
import { MessageResponse, ConversationResponse } from '../../lib/api/types'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Avatar, Skeleton } from '../ui'
import { cn } from '../../lib/utils'
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'

interface ChatWindowProps {
    conversation: ConversationResponse | null
    messages: MessageResponse[]
    currentUserId: number
    onSendMessage: (content: string) => void
    isLoading?: boolean
    isSending?: boolean
    hasMoreMessages?: boolean
    onLoadMore?: () => void
    onBack?: () => void
}

function DateDivider({ date }: { date: Date }) {
    let dateLabel: string

    if (isToday(date)) {
        dateLabel = 'Today'
    } else if (isYesterday(date)) {
        dateLabel = 'Yesterday'
    } else {
        dateLabel = format(date, 'MMMM d, yyyy')
    }

    return (
        <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full">
                {dateLabel}
            </span>
        </div>
    )
}

export function ChatWindow({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
    isLoading,
    isSending,
    hasMoreMessages,
    onLoadMore,
    onBack,
}: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!messagesContainerRef.current || !hasMoreMessages || isLoading) return

        const { scrollTop } = messagesContainerRef.current
        if (scrollTop === 0 && onLoadMore) {
            onLoadMore()
        }
    }

    if (!conversation) {
        return null
    }

    // Group messages by date
    const groupedMessages: { date: Date; messages: MessageResponse[] }[] = []
    let currentGroup: { date: Date; messages: MessageResponse[] } | null = null

    messages.forEach((message) => {
        const messageDate = new Date(message.createdAt)

        if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
            currentGroup = { date: messageDate, messages: [message] }
            groupedMessages.push(currentGroup)
        } else {
            currentGroup.messages.push(message)
        }
    })

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors md:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}
                    <Avatar
                        src={conversation.participantAvatar}
                        name={conversation.participantName || `User ${conversation.participantId}`}
                        size="md"
                    />
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            {conversation.participantName || `User ${conversation.participantId}`}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Video className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-2"
            >
                {isLoading && messages.length === 0 ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex gap-2 max-w-[75%]',
                                    i % 2 === 0 ? 'mr-auto' : 'ml-auto flex-row-reverse'
                                )}
                            >
                                <Skeleton className={cn(
                                    'h-16 rounded-2xl',
                                    i % 2 === 0 ? 'w-48' : 'w-56'
                                )} />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            No messages yet. Start a conversation!
                        </p>
                    </div>
                ) : (
                    <>
                        {hasMoreMessages && (
                            <div className="flex justify-center py-2">
                                <button
                                    onClick={onLoadMore}
                                    disabled={isLoading}
                                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    {isLoading ? 'Loading...' : 'Load older messages'}
                                </button>
                            </div>
                        )}
                        
                        {groupedMessages.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                <DateDivider date={group.date} />
                                <div className="space-y-2">
                                    {group.messages.map((message) => (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            isOwn={message.senderId === currentUserId}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSendMessage={onSendMessage} disabled={isSending} />
        </div>
    )
}
