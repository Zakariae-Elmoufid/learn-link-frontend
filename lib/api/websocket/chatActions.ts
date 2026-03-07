import { getClient, isWebSocketConnected } from "./stompClient"
import { ChatMessageRequest, TypingIndicator, ReadReceiptRequest } from "@/lib/api/types"

/**
 * Send a chat message via WebSocket
 */
export const sendSocketMessage = (message: ChatMessageRequest) => {
    const client = getClient()
    
    if (!client?.active) {
        console.error("WebSocket not connected. Cannot send message.")
        return false
    }

    client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(message)
    })
    
    return true
}

/**
 * Send typing indicator via WebSocket
 */
export const sendTypingIndicator = (recipientId: number, isTyping: boolean) => {
    const client = getClient()
    
    if (!client?.active) {
        return false
    }

    const indicator: TypingIndicator = {
        recipientId,
        typing: isTyping
    }

    client.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify(indicator)
    })
    
    return true
}

/**
 * Send read receipt via WebSocket
 */
export const sendReadReceipt = (messageId: number) => {
    const client = getClient()
    
    if (!client?.active) {
        return false
    }

    const receipt: ReadReceiptRequest = {
        messageId
    }

    client.publish({
        destination: "/app/chat.read",
        body: JSON.stringify(receipt)
    })
    
    return true
}

export { isWebSocketConnected }