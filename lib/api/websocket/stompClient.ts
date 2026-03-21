import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { tokenStorage, API_BASE_URL } from "@/lib/api/api-client"
import { MessageResponse, TypingNotification, ReadReceiptNotification } from "@/lib/api/types"

let client: Client | null = null
let isConnecting = false

type MessageCallback = (message: MessageResponse) => void
type TypingCallback = (notification: TypingNotification) => void
type ReadReceiptCallback = (notification: ReadReceiptNotification) => void

interface WebSocketCallbacks {
    onMessage?: MessageCallback
    onTyping?: TypingCallback
    onReadReceipt?: ReadReceiptCallback
    onConnect?: () => void
    onDisconnect?: () => void
    onError?: (error: string) => void
}

let callbacks: WebSocketCallbacks = {}

export const setWebSocketCallbacks = (newCallbacks: WebSocketCallbacks) => {
    callbacks = { ...callbacks, ...newCallbacks }
    console.log("[WS] Callbacks updated:", {
        hasOnMessage: !!callbacks.onMessage,
        hasOnTyping: !!callbacks.onTyping,
        hasOnReadReceipt: !!callbacks.onReadReceipt,
        hasOnConnect: !!callbacks.onConnect,
    })
}

export const createWebSocketClient = (token?: string): Client => {
    if (client?.active) {
        return client
    }

    const accessToken = token || tokenStorage.getAccess()
    
    if (!accessToken) {
        throw new Error("No authentication token available for WebSocket connection")
    }

    const wsBaseUrl = API_BASE_URL.replace('/api', '')

    
    // Create SockJS
    const socket = new SockJS(`http://localhost:8081/chat`)
    client = new Client({
        webSocketFactory: () => socket,
        
        // Also pass token in STOMP headers for the ChannelInterceptor
        connectHeaders: {
            Authorization: `Bearer ${accessToken}`,
        },

        reconnectDelay: 5000,


        debug: (str) => {
            // Always log for debugging
            console.log("WS:", str)
        },

        onConnect: () => {
            console.log("WebSocket connected successfully")
            isConnecting = false
            subscribeToQueues()
            callbacks.onConnect?.()
        },

        onDisconnect: () => {
            console.log("WebSocket disconnected")
            callbacks.onDisconnect?.()
        },

        onStompError: (frame) => {
            console.error("STOMP error:", frame.headers["message"])
            callbacks.onError?.(frame.headers["message"] || "WebSocket error")
        },

        onWebSocketError: (event) => {
            console.error("WebSocket error:", event)
            callbacks.onError?.("WebSocket connection error")
        },
    })

    return client
}

const subscribeToQueues = () => {
    if (!client?.active) {
        console.warn("[WS] Cannot subscribe - client not active")
        return
    }

    console.log("[WS] Subscribing to message queues...")

    // Subscribe to receive messages
    client.subscribe("/user/queue/messages", (message: IMessage) => {
        console.log("[WS] Raw message received on /user/queue/messages")
        try {
            const messageData: MessageResponse = JSON.parse(message.body)
            console.log("[WS] Parsed message data:", messageData)
            if (callbacks.onMessage) {
                console.log("[WS] Calling onMessage callback...")
                callbacks.onMessage(messageData)
            } else {
                console.warn("[WS] No onMessage callback registered!")
            }
        } catch (error) {
            console.error("[WS] Error parsing message:", error)
        }
    })
    console.log("[WS] Subscribed to /user/queue/messages")

    // Subscribe to typing indicators
    client.subscribe("/user/queue/typing", (message: IMessage) => {
        try {
            const typingData: TypingNotification = JSON.parse(message.body)
            callbacks.onTyping?.(typingData)
        } catch (error) {
            console.error("[WS] Error parsing typing indicator:", error)
        }
    })
    console.log("[WS] Subscribed to /user/queue/typing")

    // Subscribe to read receipts
    client.subscribe("/user/queue/read-receipts", (message: IMessage) => {
        try {
            const receiptData: ReadReceiptNotification = JSON.parse(message.body)
            callbacks.onReadReceipt?.(receiptData)
        } catch (error) {
            console.error("[WS] Error parsing read receipt:", error)
        }
    })
    console.log("[WS] Subscribed to /user/queue/read-receipts")
    console.log("[WS] All subscriptions complete")
}

export const connectWebSocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (client?.active) {
            resolve()
            return
        }

        if (isConnecting) {
            // Wait for existing connection attempt
            const checkConnection = setInterval(() => {
                if (client?.active) {
                    clearInterval(checkConnection)
                    resolve()
                }
            }, 100)
            return
        }

        try {
            isConnecting = true
            const wsClient = createWebSocketClient()
            
            const originalOnConnect = wsClient.onConnect
            wsClient.onConnect = (frame) => {
                originalOnConnect?.(frame)
                resolve()
            }

            wsClient.onStompError = (frame) => {
                isConnecting = false
                reject(new Error(frame.headers["message"] || "Connection failed"))
            }

            wsClient.activate()
        } catch (error) {
            isConnecting = false
            reject(error)
        }
    })
}

export const disconnectWebSocket = () => {
    if (client?.active) {
        client.deactivate()
        client = null
    }
}

export const isWebSocketConnected = (): boolean => {
    return client?.active ?? false
}

export const getClient = () => client