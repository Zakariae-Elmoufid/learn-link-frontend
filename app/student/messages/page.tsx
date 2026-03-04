'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConversationList, ChatWindow, MessagingEmptyState } from '../../../components/messaging'
import { useConversations, useMessages, useSendMessage, useMarkConversationAsRead, useUnreadCount } from '../../../hookes'
import { useMessageStore, useAuthStore } from '../../../stores'
import { MessageSquarePlus } from 'lucide-react'
import { cn } from '../../../lib/utils'

export default function MessagesPage() {
    const router = useRouter()
    const user = useAuthStore((s) => s.user)
    
    // Store state
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        messages,
        searchQuery,
        setSearchQuery,
    } = useMessageStore()

    // Queries
    const { isLoading: conversationsLoading } = useConversations()
    const { 
        isLoading: messagesLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useMessages(activeConversationId)
    
    // Mutations
    const sendMessage = useSendMessage()
    const markAsRead = useMarkConversationAsRead()

    // Fetch unread count
    useUnreadCount()

    // Get active conversation details
    const activeConversation = conversations.find(
        (c) => c.participantId === activeConversationId
    ) || null

    // Mark conversation as read when selected
    useEffect(() => {
        if (activeConversationId && activeConversation?.unreadCount && activeConversation.unreadCount > 0) {
            markAsRead.mutate(activeConversationId)
        }
    }, [activeConversationId])

    const handleSelectConversation = (participantId: number) => {
        setActiveConversation(participantId)
    }

    const handleSendMessage = (content: string) => {
        if (!activeConversationId) return

        sendMessage.mutate({
            recipientId: activeConversationId,
            content,
            type: 'TEXT',
        })
    }

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }

    const handleFindPartners = () => {
        // Navigate to connections page (cast to any to bypass type checking for non-existent routes)
        window.location.href = '/student/connections'
    }

    const handleExploreGroups = () => {
        // Navigate to groups page
        window.location.href = '/student/groups'
    }

    // Mobile responsive state
    const [showChat, setShowChat] = useState(false)

    useEffect(() => {
        if (activeConversationId) {
            setShowChat(true)
        }
    }, [activeConversationId])

    const handleBackToList = () => {
        setShowChat(false)
        setActiveConversation(null)
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex">
            {/* Conversation List - Hidden on mobile when chat is open */}
            <div
                className={cn(
                    'w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0',
                    showChat ? 'hidden md:flex md:flex-col' : 'flex flex-col'
                )}
            >
                <ConversationList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isLoading={conversationsLoading}
                />
            </div>

            {/* Chat Window or Empty State */}
            <div
                className={cn(
                    'flex-1 flex flex-col',
                    !showChat && activeConversationId === null ? 'hidden md:flex' : 'flex'
                )}
            >
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        messages={messages}
                        currentUserId={user?.id ?? 0}
                        onSendMessage={handleSendMessage}
                        isLoading={messagesLoading || isFetchingNextPage}
                        isSending={sendMessage.isPending}
                        hasMoreMessages={hasNextPage}
                        onLoadMore={handleLoadMore}
                        onBack={handleBackToList}
                    />
                ) : (
                    <MessagingEmptyState
                        onFindPartners={handleFindPartners}
                        onExploreGroups={handleExploreGroups}
                    />
                )}
            </div>

            {/* Floating Action Button - Mobile only */}
            <button
                onClick={() => window.location.href = '/student/connections'}
                className="fixed right-6 bottom-6 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors md:hidden"
            >
                <MessageSquarePlus className="h-6 w-6" />
            </button>
        </div>
    )
}
