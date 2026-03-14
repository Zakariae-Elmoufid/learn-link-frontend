import { useEffect, useRef, useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
    connectWebSocket,
    disconnectWebSocket,
    setWebSocketCallbacks,
    isWebSocketConnected,
} from "../lib/api/websocket/stompClient"
import {
    sendSocketMessage,
    sendTypingIndicator,
    sendReadReceipt,
} from "../lib/api/websocket/chatActions"
import { useMessageStore, useAuthStore } from "../stores"
import { messageKeys } from "./useMessaging"
import { ChatMessageRequest, MessageResponse, TypingNotification, ReadReceiptNotification } from "../lib/api/types"

export function useWebSocket() {
    const queryClient = useQueryClient()
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const user = useAuthStore((s) => s.user)

    const [isConnected, setIsConnected] = useState(false)

    const addMessage = useMessageStore((s) => s.addMessage)
    const updateMessage = useMessageStore((s) => s.updateMessage)
    const setUserTyping = useMessageStore((s) => s.setUserTyping)
    const updateConversation = useMessageStore((s) => s.updateConversation)
    const conversations = useMessageStore((s) => s.conversations)
    const setConversations = useMessageStore((s) => s.setConversations)

    // Use refs to always have latest values in callbacks
    const activeConversationIdRef = useRef<number | null>(null)
    const userRef = useRef(user)
    const conversationsRef = useRef(conversations)
    const addMessageRef = useRef(addMessage)
    const updateConversationRef = useRef(updateConversation)
    const setConversationsRef = useRef(setConversations)

    // Sync refs with state
    const activeConversationId = useMessageStore((s) => s.activeConversationId)
    useEffect(() => {
        activeConversationIdRef.current = activeConversationId
        console.log("[WS] Active conversation updated:", activeConversationId)
    }, [activeConversationId])

    useEffect(() => {
        userRef.current = user
        console.log("[WS] User updated:", user?.id)
    }, [user])

    useEffect(() => {
        conversationsRef.current = conversations
    }, [conversations])

    useEffect(() => {
        addMessageRef.current = addMessage
        updateConversationRef.current = updateConversation
        setConversationsRef.current = setConversations
    }, [addMessage, updateConversation, setConversations])

    const connectionAttemptedRef = useRef(false)

    // Handle incoming message - this is called for both sent and received messages
    const handleMessage = useCallback((message: MessageResponse) => {
        console.log("[WS] ===== INCOMING MESSAGE =====")
        console.log("[WS] Message:", JSON.stringify(message, null, 2))
        console.log("[WS] Current user ID:", userRef.current?.id)
        console.log("[WS] Active conversation ID:", activeConversationIdRef.current)

        const currentUserId = userRef.current?.id
        if (!currentUserId) {
            console.warn("[WS] No current user ID - ignoring message")
            return
        }

        // Determine the other participant in this message
        const isSentByMe = message.senderId === currentUserId
        const otherParticipantId = isSentByMe ? message.recipientId : message.senderId

        console.log("[WS] Is sent by me:", isSentByMe)
        console.log("[WS] Other participant ID:", otherParticipantId)

        // Check if message is for the currently active conversation
        const isForActiveConversation = activeConversationIdRef.current === otherParticipantId
        console.log("[WS] Is for active conversation:", isForActiveConversation)

        if (isForActiveConversation) {
            // Add message to the active chat
            console.log("[WS] Adding message to active chat")
            addMessageRef.current(message)
        } else {
            console.log("[WS] Message is for a different conversation, not adding to chat view")
        }

        // Check if conversation exists
        const existingConversation = conversationsRef.current.find(
            c => c.participantId === otherParticipantId
        )

        if (existingConversation) {
            // Update existing conversation preview
            updateConversationRef.current(otherParticipantId, {
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                // Increment unread count only if message is from another user 
                // AND we're not viewing that conversation
                unreadCount: (!isSentByMe && !isForActiveConversation)
                    ? (existingConversation.unreadCount || 0) + 1
                    : existingConversation.unreadCount,
            })
        } else {
            // Create a new conversation entry
            const newConversation: any = {
                participantId: otherParticipantId,
                participantName: undefined,
                participantAvatar: undefined,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount: !isSentByMe ? 1 : 0,
            }
            setConversationsRef.current([newConversation, ...conversationsRef.current])
        }

        // Refresh conversations list
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
        console.log("[WS] ===== MESSAGE PROCESSED =====")
    }, [queryClient])

    // Handle typing notification
    const handleTyping = useCallback((notification: TypingNotification) => {
        setUserTyping(notification.senderId, notification.typing)
    }, [setUserTyping])

    // Handle read receipt
    const handleReadReceipt = useCallback((notification: ReadReceiptNotification) => {
        updateMessage(notification.messageId, {
            status: "READ",
            readAt: notification.readAt,
        })
    }, [updateMessage])

    // Connect WebSocket and set up callbacks
    useEffect(() => {
        console.log("[WS] Effect running - isAuthenticated:", isAuthenticated, "user:", user?.id)

        if (!isAuthenticated) {
            console.log("[WS] Not authenticated, skipping connection")
            return
        }

        // Always update callbacks (even if already connected)
        setWebSocketCallbacks({
            onMessage: handleMessage,
            onTyping: handleTyping,
            onReadReceipt: handleReadReceipt,
            onConnect: () => {
                console.log("[WS] WebSocket connected - ready to receive messages")
                setIsConnected(true)
            },
            onDisconnect: () => {
                console.log("[WS] WebSocket disconnected")
                setIsConnected(false)
                connectionAttemptedRef.current = false
            },
            onError: (error) => {
                console.error("[WS] WebSocket error:", error)
                setIsConnected(false)
                connectionAttemptedRef.current = false
            },
        })

        // Only connect once
        if (connectionAttemptedRef.current) {
            console.log("[WS] Connection already attempted, checking status...")
            // Check if already connected
            const connected = isWebSocketConnected()
            console.log("[WS] Current connection status:", connected)
            setIsConnected(connected)
            return
        }

        connectionAttemptedRef.current = true
        console.log("[WS] Attempting WebSocket connection...")

        // Connect
        connectWebSocket()
            .then(() => {
                console.log("[WS] WebSocket connection established successfully")
                setIsConnected(true)
            })
            .catch((error) => {
                console.error("[WS] Failed to connect WebSocket:", error)
                setIsConnected(false)
                connectionAttemptedRef.current = false
            })

        // Cleanup on unmount
        return () => {
            disconnectWebSocket()
            setIsConnected(false)
            connectionAttemptedRef.current = false
        }
    }, [isAuthenticated, handleMessage, handleTyping, handleReadReceipt])

    // Send message via WebSocket
    const sendMessage = useCallback((recipientId: number, content: string, type: "TEXT" | "IMAGE" | "FILE" | "LINK" = "TEXT") => {
        const message: ChatMessageRequest = {
            recipientId,
            content,
            type,
        }
        return sendSocketMessage(message)
    }, [])

    // Send typing indicator
    const setTyping = useCallback((recipientId: number, isTyping: boolean) => {
        return sendTypingIndicator(recipientId, isTyping)
    }, [])

    // Send read receipt
    const markMessageRead = useCallback((messageId: number) => {
        return sendReadReceipt(messageId)
    }, [])

    return {
        isConnected,
        sendMessage,
        setTyping,
        markMessageRead,
    }
}
