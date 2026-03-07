import { apiClient } from '../api-client'
import {
    MessageResponse,
    ConversationResponse,
    SendMessageRequest,
    MessagesPageResponse,
} from '../types'

export const messageService = {
    /**
     * Send a new message
     */
    sendMessage: (data: SendMessageRequest) =>
        apiClient.post<MessageResponse>('/messages', data).then((r) => r.data),

    /**
     * Get message by ID
     */
    getMessageById: (messageId: number) =>
        apiClient.get<MessageResponse>(`/messages/${messageId}`).then((r) => r.data),

    /**
     * Get conversation with another user (paginated)
     */
    getConversation: (otherUserId: number, page = 0, size = 20) =>
        apiClient
            .get<MessagesPageResponse>(`/messages/conversation/${otherUserId}`, {
                params: { page, size },
            })
            .then((r) => r.data),

    /**
     * Get all conversations for current user
     */
    getConversations: () =>
        apiClient.get<ConversationResponse[]>('/messages/conversations').then((r) => r.data),

    /**
     * Mark a message as read
     */
    markAsRead: (messageId: number) =>
        apiClient.put<void>(`/messages/${messageId}/read`).then((r) => r.data),

    /**
     * Mark all messages in a conversation as read
     */
    markConversationAsRead: (senderId: number) =>
        apiClient.put<void>(`/messages/conversation/${senderId}/read`).then((r) => r.data),

    /**
     * Delete a message
     */
    deleteMessage: (messageId: number) =>
        apiClient.delete<void>(`/messages/${messageId}`).then((r) => r.data),

    /**
     * Delete entire conversation
     */
    deleteConversation: (otherUserId: number) =>
        apiClient.delete<void>(`/messages/conversation/${otherUserId}`).then((r) => r.data),

    /**
     * Get unread message count
     */
    getUnreadCount: () =>
        apiClient.get<number>('/messages/unread/count').then((r) => r.data),

    /**
     * Get unread message count in a specific conversation
     */
    getUnreadCountInConversation: (senderId: number) =>
        apiClient.get<number>(`/messages/conversation/${senderId}/unread/count`).then((r) => r.data),
}
