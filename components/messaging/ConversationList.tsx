'use client'

import { Search, Filter, MoreHorizontal, ChevronDown, Archive, VolumeX, Trash2 } from 'lucide-react'
import { ConversationResponse } from '../../lib/api/types'
import { ConversationItem } from './ConversationItem'
import { Input, Skeleton } from '../ui'
import { cn } from '../../lib/utils'
import { useState } from 'react'

interface ConversationListProps {
    conversations: ConversationResponse[]
    activeConversationId: number | null
    onSelectConversation: (participantId: number) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    isLoading?: boolean
}

export function ConversationList({
    conversations,
    activeConversationId,
    onSelectConversation,
    searchQuery,
    onSearchChange,
    isLoading,
}: ConversationListProps) {
    const [recentChatsExpanded, setRecentChatsExpanded] = useState(true)
    const [studyGroupsExpanded, setStudyGroupsExpanded] = useState(true)

    // Filter conversations based on search query
    const filteredConversations = conversations.filter((conv) =>
        conv.participant.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // For now, we'll show all as "Recent Chats"
    // In the future, you can separate study groups based on a flag
    const recentChats = filteredConversations
    const studyGroups: ConversationResponse[] = [] // Placeholder for study groups

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Messages</h2>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Filter className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Recent Chats Section */}
                        <div className="px-2 py-2">
                            <button
                                onClick={() => setRecentChatsExpanded(!recentChatsExpanded)}
                                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                <span>Recent Chats</span>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        !recentChatsExpanded && '-rotate-90'
                                    )}
                                />
                            </button>

                            {recentChatsExpanded && (
                                <div className="mt-1 space-y-0.5">
                                    {recentChats.length === 0 ? (
                                        <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                                            No conversations yet
                                        </p>
                                    ) : (
                                        recentChats.map((conversation) => (
                                            <ConversationItem
                                                key={conversation.participantId}
                                                conversation={conversation}
                                                isActive={activeConversationId === conversation.participantId}
                                                onClick={() => onSelectConversation(conversation.participantId)}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Study Groups Section */}
                        {studyGroups.length > 0 && (
                            <div className="px-2 py-2 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setStudyGroupsExpanded(!studyGroupsExpanded)}
                                    className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    <span>Study Groups</span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 transition-transform',
                                            !studyGroupsExpanded && '-rotate-90'
                                        )}
                                    />
                                </button>

                                {studyGroupsExpanded && (
                                    <div className="mt-1 space-y-0.5">
                                        {studyGroups.map((conversation) => (
                                            <ConversationItem
                                                key={conversation.participantId}
                                                conversation={conversation}
                                                isActive={activeConversationId === conversation.participantId}
                                                onClick={() => onSelectConversation(conversation.participantId)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <button className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                        <Archive className="h-4 w-4" />
                        <span>Archived</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                        <VolumeX className="h-4 w-4" />
                        <span>Muted</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
