import { create } from 'zustand'
import { ConversationResponse, MessageResponse } from '../lib/api/types'

interface TypingUser {
    odinguserId: number
    timestamp: number
}

interface MessageState {
    // Conversations list
    conversations: ConversationResponse[]
    setConversations: (conversations: ConversationResponse[]) => void
    updateConversation: (participantId: number, updates: Partial<ConversationResponse>) => void

    // Active conversation
    activeConversationId: number | null
    setActiveConversation: (participantId: number | null) => void

    // Messages for active conversation
    messages: MessageResponse[]
    setMessages: (messages: MessageResponse[]) => void
    addMessage: (message: MessageResponse) => void
    updateMessage: (messageId: number, updates: Partial<MessageResponse>) => void
    prependMessages: (messages: MessageResponse[]) => void

    // Typing indicators
    typingUsers: Map<number, TypingUser>
    setUserTyping: (userId: number, isTyping: boolean) => void

    // Unread count
    totalUnreadCount: number
    setTotalUnreadCount: (count: number) => void
    decrementUnreadCount: (amount?: number) => void

    // UI State
    searchQuery: string
    setSearchQuery: (query: string) => void

    // Reset
    reset: () => void
}

const initialState = {
    conversations: [],
    activeConversationId: null,
    messages: [],
    typingUsers: new Map<number, TypingUser>(),
    totalUnreadCount: 0,
    searchQuery: '',
}

export const useMessageStore = create<MessageState>()((set, get) => ({
    ...initialState,

    setConversations: (conversations) => set({ conversations }),

    updateConversation: (participantId, updates) =>
        set((state) => ({
            conversations: state.conversations.map((conv) =>
                conv.participantId === participantId ? { ...conv, ...updates } : conv
            ),
        })),

    setActiveConversation: (participantId) => {
        console.log("[Store] setActiveConversation:", participantId)
        set({ activeConversationId: participantId })
    },

    setMessages: (messages) => {
        console.log("[Store] setMessages called with", messages.length, "messages")
        set({ messages })
    },

    addMessage: (message) =>
        set((state) => {
            // Check if message already exists
            const exists = state.messages.some((m) => m.id === message.id)
            if (exists) {
                console.log("[Store] Message already exists, skipping:", message.id)
                return state
            }

            console.log("[Store] Adding new message:", message.id, "Total:", state.messages.length + 1)
            return {
                messages: [...state.messages, message],
            }
        }),

    updateMessage: (messageId, updates) =>
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
            ),
        })),

    prependMessages: (newMessages) =>
        set((state) => {
            // Filter out duplicates
            const existingIds = new Set(state.messages.map((m) => m.id))
            const uniqueNewMessages = newMessages.filter((m) => !existingIds.has(m.id))
            return {
                messages: [...uniqueNewMessages, ...state.messages],
            }
        }),

    setUserTyping: (userId, isTyping) =>
        set((state) => {
            const newTypingUsers = new Map(state.typingUsers)
            if (isTyping) {
                newTypingUsers.set(userId, { odinguserId: userId, timestamp: Date.now() })
            } else {
                newTypingUsers.delete(userId)
            }
            return { typingUsers: newTypingUsers }
        }),

    setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),

    decrementUnreadCount: (amount = 1) =>
        set((state) => ({
            totalUnreadCount: Math.max(0, state.totalUnreadCount - amount),
        })),

    setSearchQuery: (query) => set({ searchQuery: query }),

    reset: () => set(initialState),
}))
