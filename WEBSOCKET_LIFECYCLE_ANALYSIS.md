# WebSocket Lifecycle Analysis - When It Opens & Closes

## Overview
**WebSocket is per-user** - Each user has their own separate persistent connection. When two users are chatting, they each have **their own independent WebSocket connection** to the backend.

---

## Connection Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER A                                      │
│                                                                     │
│  Browser Opens App                                                  │
│       ↓                                                             │
│  [Providers] initializes (root level)                               │
│  [useInitAuth] checks for JWT token                                 │
│       ↓                                                             │
│  User navigates to /student/messages                                │
│       ↓                                                             │
│  [MessagesPage] component mounts                                    │
│  [useWebSocket] hook runs                                           │
│       ├─ Check: isAuthenticated?                                   │
│       ├─ YES → connectWebSocket()                                   │
│       │     ├─ Create SockJS bridge                                │
│       │     ├─ Connect to /chat endpoint with JWT token            │
│       │     └─ On success:  
│       │        ├─ subscribeToQueues()                              │
│       │        │  ├─ /user/queue/messages                          │
│       │        │  ├─ /user/queue/typing                            │
│       │        │  └─ /user/queue/read-receipts                     │
│       │        └─ setIsConnected(true) ✅                          │
│       │                                                             │
│       └─ Auto-reconnect every 5s if disconnects                    │
│                                                                     │
│  User sends/receives messages (connection stays open)               │
│                                                                     │
│  User leaves /student/messages OR logs out                          │
│       ↓                                                             │
│  [useWebSocket] cleanup runs                                        │
│  disconnectWebSocket()                                              │
│       ├─ client.deactivate()                                        │
│       ├─ Unsubscribe from queues                                    │
│       └─ Close connection ❌                                        │
│                                                                     │
│  isConnected = false                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WHEN WEBSOCKET OPENS ✅

### Condition 1: User is Authenticated
```typescript
// From useWebSocket.ts - Line 148
if (!isAuthenticated) {
    console.log("[WS] Not authenticated, skipping connection")
    return  // Skip connection if no auth
}
```
✅ **Opens when**: User logged in with valid JWT token

### Condition 2: User is on Messaging Page
```typescript
// useWebSocket hook is in useEffect dependency
useEffect(() => {
    // ... connection logic
}, [isAuthenticated, handleMessage, handleTyping, handleReadReceipt])
```
✅ **Opens when**: MessagesPage mounts (user navigates to /student/messages)

### Condition 3: Connection is Not Already Attempted
```typescript
// From stompClient.ts - Line 152
if (connectionAttemptedRef.current) {
    console.log("[WS] Connection already attempted, checking status...")
    const connected = isWebSocketConnected()
    setIsConnected(connected)
    return  // Don't try again
}
```
✅ **Opens when**: First time only (prevents duplicate connections)

---

## WHEN WEBSOCKET CLOSES ❌

### Reason 1: User Logs Out
```typescript
// When isAuthenticated changes to false
useEffect(() => {
    if (!isAuthenticated) return  // Stop everything
    
    // ... rest of connection code
}, [isAuthenticated, ...])
```
❌ **Closes when**: 
- User clicks Logout
- JWT token expires
- User session ends

### Reason 2: User Leaves Messaging Page
```typescript
// Cleanup function runs when component unmounts
return () => {
    disconnectWebSocket()
    setIsConnected(false)
    connectionAttemptedRef.current = false
}
```
❌ **Closes when**: 
- User navigates away from /student/messages
- User closes the browser/tab
- Page refreshes

### Reason 3: Network Error or Server Issue
```typescript
// From stompClient.ts - Line 74-79
onStompError: (frame) => {
    console.error("STOMP error:", frame.headers["message"])
    callbacks.onError?.(...)
}

onWebSocketError: (event) => {
    console.error("WebSocket error:", event)
    callbacks.onError?.("WebSocket connection error")
}
```
❌ **Closes when**: 
- Network connection lost
- Server WebSocket endpoint down
- Token becomes invalid

---

## AUTO-RECONNECTION LOGIC

```typescript
// From stompClient.ts - Line 61
reconnectDelay: 5000  // Try to reconnect every 5 seconds
```

**If connection breaks:**
```
Connection Lost
    ↓
Wait 5 seconds
    ↓
Attempt to reconnect
    ├─ Success? → Connected ✅
    └─ Fail? → Wait 5s, try again
```

**Logs to watch:**
```javascript
// Connection established
"WebSocket connected successfully"
"[WS] Subscribed to /user/queue/messages"
"[WS] Subscribed to /user/queue/typing"
"[WS] Subscribed to /user/queue/read-receipts"

// Connection broken
"WebSocket disconnected"
"STOMP error: ..."
"WebSocket error: ..."

// Reconnecting
"[WS] Attempting WebSocket connection..."
```

---

## TWO USERS COMMUNICATING - CONNECTION DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                               │
│                                                                     │
│  ┌─────────────────┬─────────────────┬─────────────────┐            │
│  │ /chat Endpoint  │  Message Queue  │  Notification   │            │
│  │  (WebSocket)    │  System         │  Manager        │            │
│  └────────┬────────┴────────┬────────┴────────┬────────┘            │
│           │                 │                 │                    │
└───────────┼─────────────────┼─────────────────┼────────────────────┘
            │                 │                 │
            │ OPEN            │                 │
         ┌──┴──┐              │                 │
         │     │              │                 │
      USER A  USER B          │                 │
    ┌────┴────────┐           │                 │
    │             │           │                 │
 Connected    Connected       │                 │
   ✅           ✅            │                 │
    │             │           │                 │
    │ Sends msg   │           │                 │
    │────────────>│ PUBLISH   │                 │
    │             │──────────>│ /app/chat.send  │
    │             │           │    (message)    │
    │             │           │                 │
    │             │           │ Process & Save  │
    │             │           │                 │
    │             │<──────────┤ PUSH            │
    │ RECEIVE     │ /user/queue/messages        │
    │<────────────┤────────────┤ (from server)   │
    │             │           │                 │
    │        ┌────────────┐   │                 │
    │        │ QUEUES:    │   │                 │
    │        │ - messages │   │                 │
    │        │ - typing   │   │                 │
    │        │ - receipts │   │                 │
    │        └────────────┘   │                 │
    │             │           │                 │
  USER A      USER B       BACKEND           MANAGER
  User A            User B
  Connected         Connected
  ✅               ✅
```

---

## Real Scenario: Step-by-Step Connection Lifecycle

### User A's Perspective:

```
09:00 - User A logs in
          ↓
        [MessagesPage mounts]
          ↓
        [useWebSocket] runs
          ├─ isAuthenticated? YES
          ├─ connectWebSocket()
          └─ Connection: OPEN ✅
          
        Browser Console:
        "WebSocket connected successfully"
        "[WS] Subscribed to /user/queue/messages"
        "_[WS] Subscribed to /user/queue/typing"
        "[WS] Subscribed to /user/queue/read-receipts"
        
09:15 - User A sends message to User B
        ├─ sendWebSocketMessage()
        ├─ PUBLISH: /app/chat.send
        └─ Server receives & broadcasts
        
09:20 - User B comes online & sends message back
        ├─ Server receives from B
        ├─ PUSH to A's /user/queue/messages
        ├─ handleMessage callback triggered
        └─ Message appears in chat
        
09:30 - User A closes the app / logs out
        ├─ MessagesPage unmounts
        ├─ useWebSocket cleanup runs
        ├─ disconnectWebSocket()
        └─ Connection: CLOSED ❌
        
        Browser Console:
        "WebSocket disconnected"
```

---

## Connection State Matrix

### USER A

| Time | Page | Auth | Connection | Status |
|------|------|------|------------|--------|
| 09:00 | / | ✅ | CLOSED | Waiting |
| 09:01 | /student/messages | ✅ | OPENING | Attempting |
| 09:02 | /student/messages | ✅ | OPEN ✅ | Ready |
| 09:15 | /student/messages | ✅ | OPEN ✅ | Sending/Receiving |
| 09:30 | /student/profile | ✅ | CLOSED | Left messaging |
| 09:35 | /student/messages | ✅ | OPEN ✅ | Reconnected |
| 09:40 | / | ❌ | CLOSED | Logged out |

### USER B (Independent Connection)

| Time | Page | Auth | Connection | Status |
|------|------|------|------------|--------|
| 09:00 | / | ✅ | CLOSED | Offline |
| 09:20 | /student/messages | ✅ | OPEN ✅ | Ready |
| 09:21 | /student/messages | ✅ | OPEN ✅ | Receiving A's msg |
| 09:22 | /student/messages | ✅ | OPEN ✅ | Sending to A |
| 09:45 | /student/messages | ✅ | OPEN ✅ | Still connected |

---

## Important: One Connection Per User

```
❌ WRONG - Each conversation doesn't have separate connection
                Message to User B
                     ↓
            ┌────────────────┐
            │  WebSocket 1   │ (talking to User B)
            └────────────────┘
                Message to User C
                     ↓
            ┌────────────────┐
            │  WebSocket 2   │ (talking to User C)  
            └────────────────┘


✅ CORRECT - One persistent connection for all conversations
                Message to User B (recipientId: 5)
                Message to User C (recipientId: 7)
                Message to User D (recipientId: 12)
                     ↓
            ┌────────────────┐
            │  WebSocket 1   │ (all conversations use same connection)
            └────────────────┘
```

**All messages go through the SAME WebSocket connection:**
```typescript
// Same client for all conversations
client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({ recipientId: 5, content: "Hi User B" })
})

// Next message - same connection
client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({ recipientId: 7, content: "Hi User C" })
})

// All messages queue up on same connection
```

---

## Connection Persistence Across Conversations

```
User A in Chat with User B
WebSocket: OPEN ✅
│
├─ User switches to Chat with User C
│  WebSocket: STILL OPEN ✅ (no reconnection needed)
│
├─ User switches to Chat with User D
│  WebSocket: STILL OPEN ✅ (reuses same connection)
│
├─ User navigates away from Messages
│  WebSocket: CLOSES ❌
│
└─ User comes back to Messages
   WebSocket: RECONNECTS ✅ (new connection)
```

---

## Code Flow: Opening Connection

```typescript
// 1. MessagesPage mounts
<MessagesPage />

// 2. useWebSocket hook runs
useEffect(() => {
    // 3. Check if authenticated
    if (!isAuthenticated) return
    
    // 4. Register callbacks
    setWebSocketCallbacks({
        onMessage,
        onTyping,
        onReadReceipt,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
    })
    
    // 5. Check if already attempted
    if (connectionAttemptedRef.current) {
        setIsConnected(isWebSocketConnected())
        return
    }
    
    // 6. Mark as attempted
    connectionAttemptedRef.current = true
    
    // 7. Connect
    connectWebSocket()
        .then(() => {
            console.log("[WS] Connected")
            setIsConnected(true)
        })
        .catch((error) => {
            console.error("[WS] Failed:", error)
            setIsConnected(false)
            connectionAttemptedRef.current = false  // Allow retry
        })
    
    // 8. Cleanup on unmount
    return () => {
        disconnectWebSocket()
        setIsConnected(false)
        connectionAttemptedRef.current = false
    }
}, [isAuthenticated, handleMessage, handleTyping, handleReadReceipt])
```

---

## Code Flow: Closing Connection

```typescript
// Cleanup function (runs when MessagesPage unmounts)
return () => {
    // 1. Disconnect WebSocket
    disconnectWebSocket()  // client.deactivate()
    
    // 2. Update state
    setIsConnected(false)
    
    // 3. Reset flag to allow future connections
    connectionAttemptedRef.current = false
}


// Also closes when:
// - isAuthenticated becomes false
//   └─ useEffect dependency triggers cleanup
// - User logs out
//   └─ JWT token removed
//   └─ isAuthenticated = false
//   └─ useEffect cleanup runs
```

---

## Debugging: Check Connection Status

```javascript
// In browser console:

// Check if WebSocket is connected NOW
const { isConnected } = useWebSocket()
console.log("WebSocket status:", isConnected)

// Check if user is authenticated
const { isAuthenticated } = useAuthStore((s) => s.isAuthenticated)
console.log("Authenticated:", isAuthenticated)

// Check current user
const { user } = useAuthStore((s) => s.user)
console.log("Current user:", user?.id)

// Watch for connection events
// Filter console logs for: [WS]
// Look for:
// ✅ "WebSocket connected successfully"
// ❌ "WebSocket disconnected"
// 🔄 "Attempting WebSocket connection..."

// Check subscriptions
// Search for: "Subscribed to /user/queue"
```

---

## Summary: Connection Timeline

| Event | Opens? | Closes? | Reconnects? |
|-------|--------|---------|------------|
| **User logs in** | ✅ When navigates to /messages | | |
| **User stays in chat** | | ❌ Never (persistent) | |
| **User navigates away** | | ❌ Closes | ✅ If comes back |
| **Network drops** | | ✅ Closes | ✅ Auto (5s retry) |
| **Token expires** | | ✅ Closes | ❌ No (needs re-auth) |
| **User logs out** | | ✅ Closes | ❌ No |
| **Browser tab closes** | | ✅ Closes | ❌ No |
| **Page refreshes** | ✅ New connection | ✅ Old closes | ✅ New opens |

---

## Key Takeaway

**WebSocket stays OPEN as long as:**
- ✅ User is authenticated (valid JWT)
- ✅ User is on /student/messages page
- ✅ Network connection is stable
- ✅ Browser tab is active

**WebSocket CLOSES when:**
- ❌ User logs out
- ❌ User leaves /student/messages
- ❌ Page refreshes (old closes, new opens)
- ❌ Browser tab closes
- ❌ Network connection lost (5s reconnect attempt)
- ❌ JWT token expires

**Multiple users = Multiple independent connections**
- User A has their own connection
- User B has their own connection  
- They can talk via shared backend queues
