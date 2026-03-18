"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ConversationList,
  ChatWindow,
  MessagingEmptyState,
} from "../../../components/messaging";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkConversationAsRead,
  useUnreadCount,
  useWebSocket,
} from "../../../hookes";
import { useMessageStore, useAuthStore } from "../../../stores";
import { MessageSquarePlus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ConversationResponse } from "../../../lib/api/types";

export default function MessagesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Store state
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    messages,
    searchQuery,
    setSearchQuery,
    pendingConversationUser,
    setPendingConversationUser,
    addConversation,
  } = useMessageStore();

  // Initialize WebSocket connection
  const { sendMessage: sendWebSocketMessage, isConnected } = useWebSocket();

  // Debug: Log only after mount (avoid hydration issues)
  useEffect(() => {
    console.log("[MessagesPage] Current user:", user)
    console.log("[MessagesPage] User ID:", user?.id)
    console.log("[MessagesPage] Messages count:", messages.length)
    console.log("[MessagesPage] Active conversation:", activeConversationId)
    console.log("[MessagesPage] Pending conversation user:", pendingConversationUser)
    console.log("[MessagesPage] WebSocket connected:", isConnected)
  }, [user, messages.length, activeConversationId, pendingConversationUser, isConnected])

  // Queries
  const { isLoading: conversationsLoading } = useConversations();
  const {
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(activeConversationId);

  // Mutations (fallback for when WebSocket is not connected)
  const sendMessageMutation = useSendMessage();
  const markAsRead = useMarkConversationAsRead();

  // Fetch unread count
  useUnreadCount();

  // Clear pending conversation user when switching to an existing conversation
  useEffect(() => {
    if (activeConversationId) {
      const existingConversation = conversations.find(c => c.participantId === activeConversationId);
      if (existingConversation && pendingConversationUser) {
        setPendingConversationUser(null);
      }
    }
  }, [activeConversationId, conversations, pendingConversationUser, setPendingConversationUser]);

  // Get active conversation details
  const existingConversation =
    conversations.find((c) => c.participantId === activeConversationId) || null;

  // Create virtual conversation from pending user if no existing conversation
  const activeConversation: ConversationResponse | null = existingConversation || (
    pendingConversationUser && activeConversationId === pendingConversationUser.id
      ? {
          participantId: pendingConversationUser.id,
          participant: {
            userId: pendingConversationUser.id,
            firstName: pendingConversationUser.firstName,
            lastName: pendingConversationUser.lastName,
            profilePictureUrl: pendingConversationUser.profilePictureUrl,
          } as any,
          participantAvatar: pendingConversationUser.profilePictureUrl,
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        }
      : null
  );

  // Mark conversation as read when selected
  useEffect(() => {
    if (
      activeConversationId &&
      activeConversation?.unreadCount &&
      activeConversation.unreadCount > 0
    ) {
      markAsRead.mutate(activeConversationId);
    }
  }, [activeConversationId]);

  const handleSelectConversation = (participantId: number) => {
    setActiveConversation(participantId);
    // Clear pending user if selecting a different conversation
    if (pendingConversationUser && pendingConversationUser.id !== participantId) {
      setPendingConversationUser(null);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;

    // If this is a new conversation (from pending user), add it to conversations list
    if (pendingConversationUser && !existingConversation && activeConversation) {
      addConversation({
        ...activeConversation,
        lastMessage: content,
        lastMessageAt: new Date().toISOString(),
      });
      setPendingConversationUser(null);
    }

    // Try WebSocket first, fallback to HTTP
    if (isConnected) {
      const sent = sendWebSocketMessage(activeConversationId, content, "TEXT");
      if (!sent) {
        // Fallback to HTTP if WebSocket send fails
        sendMessageMutation.mutate({
          recipientId: activeConversationId,
          content,
          type: "TEXT",
        });
      }
    } else {
      // Use HTTP when WebSocket is not connected
      sendMessageMutation.mutate({
        recipientId: activeConversationId,
        content,
        type: "TEXT",
      });
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleFindPartners = () => {
    // Navigate to connections page (cast to any to bypass type checking for non-existent routes)
    window.location.href = "/student/connections";
  };



  // Mobile responsive state
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (activeConversationId) {
      setShowChat(true);
    }
  }, [activeConversationId]);

  const handleBackToList = () => {
    setShowChat(false);
    setActiveConversation(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversation List - Hidden on mobile when chat is open */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0",
          showChat ? "hidden md:flex md:flex-col" : "flex flex-col",
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
          "flex-1 flex flex-col",
          !showChat && activeConversationId === null
            ? "hidden md:flex"
            : "flex",
        )}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            currentUserId={user?.id ?? 0}
            onSendMessage={handleSendMessage}
            isLoading={messagesLoading || isFetchingNextPage}
            isSending={sendMessageMutation.isPending}
            hasMoreMessages={hasNextPage}
            onLoadMore={handleLoadMore}
            onBack={handleBackToList}
          />
        ) : (
          <MessagingEmptyState
            onFindPartners={handleFindPartners}
          />
        )}
      </div>

      {/* Floating Action Button - Mobile only */}
      <button
        onClick={() => (window.location.href = "/student/connections")}
        className="fixed right-6 bottom-6 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors md:hidden"
      >
        <MessageSquarePlus className="h-6 w-6" />
      </button>
    </div>
  );
}
