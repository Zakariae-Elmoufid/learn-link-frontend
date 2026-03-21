# Learn Link Messaging System - Complete Analysis

## Overview
The messaging system uses a **hybrid approach**:
- **WebSocket (STOMP)** for real-time message delivery and interactive features (typing indicators, read receipts)
- **HTTP REST API** as fallback when WebSocket is unavailable
- **Zustand Store** for state management
- **React Query** for server state and caching

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │     MessagesPage Component (app/student/messages)       │   │
│ │  - Orchestrates entire messaging flow                   │   │
│ │  - Manages active conversation state                    │   │
│ │  - Handles send/receive logic                           │   │
│ └──────────────────────────────────────────────────────────┘   │
│                          ↕                                       │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │           Message Store (Zustand)                        │   │
│ │  - conversations[]                                       │   │
│ │  - messages[]                                            │   │
│ │  - activeConversationId                                  │   │
│ │  - typingUsers Map                                       │   │
│ └──────────────────────────────────────────────────────────┘   │
│          ↕                                      ↕               │
│    Components               Hooks              Backend Connection
│    ├─ ChatWindow            ├─ useMessaging  ├─ useWebSocket    │
│    ├─ MessageBubble         ├─ useSendMessage
│    ├─ MessageInput          ├─ useMarkAsRead
│    ├─ ConversationList      └─ useConversations
│    └─ ConversationItem                                          │
│                                    ↓                            │
│                        ┌──────────────────────┐                 │
│                        │  WebSocket or HTTP   │                 │
│                        │  Communication       │                 │
│                        └──────────────────────┘                 │
│                             ↓                                   │
│                        ┌──────────────────────┐                 │
│                        │   Java Backend       │                 │
│                        │  Spring WebSocket    │                 │
│                        │  REST API            │                 │
│                        └──────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: WebSocket Connection & Initialization

### Flow:
```
App Mounts
    ↓
[useWebSocket hook runs]
    ↓
Check: isAuthenticated?
    ├─ NO → Skip connection
    └─ YES → Proceed
    ↓
setWebSocketCallbacks (register handlers)
    ├─ onMessage callback
    ├─ onTyping callback
    ├─ onReadReceipt callback
    ├─ onConnect callback
    ├─ onDisconnect callback
    └─ onError callback
    ↓
connectWebSocket() [stompClient.ts]
    ├─ Get JWT token from tokenStorage
    ├─ Create SockJS bridge (WebSocket fallback)
    ├─ Initialize STOMP client
    ├─ pass token via:
    │  ├─ Query param: ?token=JWT
    │  └─ STOMP Header: Authorization: Bearer JWT
    ├─ Connect to /chat endpoint
    └─ Wait for onConnect callback
    ↓
subscribeToQueues()
    ├─ Subscribe to: /user/queue/messages
    ├─ Subscribe to: /user/queue/typing
    └─ Subscribe to: /user/queue/read-receipts
    ↓
[WebSocket Ready] ✓
```

### Key Files:
- **[hookes/useWebSocket.ts](hookes/useWebSocket.ts)** - Hook that manages WebSocket lifecycle
- **[lib/api/websocket/stompClient.ts](lib/api/websocket/stompClient.ts)** - STOMP client configuration
- **[lib/api/websocket/chatActions.ts](lib/api/websocket/chatActions.ts)** - Message publishing functions

### State After Connection:
```javascript
useWebSocket() returns: {
  isConnected: true,           // WebSocket is active
  sendMessage(recipientId, content, type),
  setTyping(recipientId, isTyping),
  markMessageRead(messageId)
}
```

---

## Step 2: Sending a Message

### Scenario: User types message and clicks "Send"

```
User types: "Hello" and clicks Send
    ↓
[MessagesPage.handleSendMessage(content)]
    ├─ Check: isConnected?
    │  ├─ YES → Try WebSocket first
    │  │   └─ sendMessage(recipientId, content, "TEXT")
    │  │       ├─ Publish to: /app/chat.send
    │  │       ├─ Body: { recipientId, content, type: "TEXT" }
    │  │       └─ If success (returns true) → Done ✓
    │  │
    │  └─ NO or WebSocket fails → Fallback to HTTP
    │      └─ sendMessageMutation.mutate({...})
    │         ├─ POST /api/messages
    │         └─ Body: { recipientId, content, type: "TEXT" }
    ↓
[Backend processes message]
    ├─ Validate & save to database
    ├─ Broadcast to recipient via WebSocket (if online)
    └─ Return MessageResponse: {
       │  id, senderId, recipientId, content,
       │  status: "SENT", type: "TEXT",
       │  createdAt, attachmentUrl?, messageType?
       }
    ↓
Message Handling (WebSocket):
When message sent via WebSocket, handleMessage callback fires:

[useWebSocket.handleMessage(message)]
    ├─ Determine: isSentByMe = (message.senderId === currentUserId)
    ├─ Get otherParticipantId
    ├─ Check: isForActiveConversation?
    │  ├─ YES → addMessage(message) to store
    │  └─ NO → Skip adding to chat view (already shown locally)
    ├─ Update conversation:
    │  ├─ Update lastMessage
    │  ├─ Update lastMessageAt
    │  └─ Increment unreadCount (only if from different user)
    └─ Refresh conversations list
    ↓
[Store updated] messageStore.messages = [..., newMessage]
    ↓
[UI re-renders]
    ├─ ChatWindow sees new message
    ├─ Scrolls to bottom
    └─ Displays bubble with ✓ (SENT status)


Message Handling (HTTP Fallback):
[useSendMessage.onSuccess(message)]
    ├─ addMessage(message) immediately
    ├─ updateConversation() preview
    ├─ Invalidate React Query cache
    └─ UI updates immediately
```

### Status Progression:
```
User sends message:
  PENDING → SENT (via WebSocket publish)
         → DELIVERED (when server confirms)
         → READ (when recipient reads)
```

### Visual Status Icons in UI:
```
Clock icon (⏱)     = PENDING / default
Single check (✓)   = SENT
Double check (✓✓)  = DELIVERED
Double check blue  = READ (when readAt is set)
```

---

## Step 3: Receiving Messages

### Real-Time Flow:

```
Sender (User A) sends message to Recipient (User B)
    ↓
Backend publishes to /user/queue/messages/{userId}
    ├─ For User B: message appears in their queue
    └─ Trigger WebSocket to send to connected clients
    ↓
[WebSocket subscription receives]
    ├─ Endpoint: /user/queue/messages
    ├─ Listener triggers: callbacks.onMessage(message)
    └─ Data: { id, senderId, recipientId, content, status, createdAt }
    ↓
[useWebSocket.handleMessage called]
    │ (Same as Step 2 - Message Handling)
    ├─ Log comprehensive debug info
    ├─ Determine: Is this MY message or from another user?
    ├─ Determine: Is this message for active conversation?
    ├─ YES → Add to messages array
    │     └─ Store.addMessage(message)
    ├─ Update conversation list
    ├─ Increment unread count if:
    │  - From different user AND
    │  - NOT viewing that conversation
    └─ Invalidate conversations query
    ↓
[Store.messages updated]
    ├─ messageStore.addMessage(message)
    │  └─ [...messages, newMessage]
    ├─ messageStore.updateConversation(otherId, {
    │     lastMessage,
    │     lastMessageAt,
    │     unreadCount
    │  })
    └─ Zustand triggers re-render
    ↓
[Component re-renders]
    ├─ ChatWindow receives updated messages
    ├─ Renders MessageBubble for new message
    ├─ Auto-scrolls to bottom
    └─ Shows in conversation list latest preview
```

### Code Flow in [useWebSocket.ts](hookes/useWebSocket.ts#L68-L125):
```typescript
const handleMessage = useCallback((message: MessageResponse) => {
  const currentUserId = userRef.current?.id
  const isSentByMe = message.senderId === currentUserId
  const otherParticipantId = isSentByMe 
    ? message.recipientId 
    : message.senderId
  
  const isForActiveConversation = 
    activeConversationIdRef.current === otherParticipantId
  
  if (isForActiveConversation) {
    addMessageRef.current(message)  // Add to chat view
  }
  
  // Update conversation list
  updateConversationRef.current(otherParticipantId, {
    lastMessage: message.content,
    lastMessageAt: message.createdAt,
    unreadCount: (!isSentByMe && !isForActiveConversation)
      ? (existingConversation.unreadCount || 0) + 1
      : existingConversation.unreadCount,
  })
}, [])
```

---

## Step 4: Read Receipts

### Flow - When User Opens Chat:

```
User clicks on conversation (activeConversationId set)
    ↓
[MessagesPage - Effect runs]
Check: Do I have unread messages?
    ├─ YES → Call markConversationAsRead(recipientId)
    │        HTTP PUT: /api/messages/conversation/{senderId}/read
    │        
    │        Backend marks ALL messages from that user as READ
    │        Broadcasts read receipt via WebSocket:
    │           /user/queue/read-receipts
    │           Body: { messageId, status: "READ", readAt }
    │
    └─ NO → Skip
    ↓
[WebSocket receives read receipt]
    ├─ Endpoint: /user/queue/read-receipts
    ├─ Data: ReadReceiptNotification { messageId, readAt }
    └─ Callback: callbacks.onReadReceipt(notification)
    ↓
[useWebSocket.handleReadReceipt]
    ├─ updateMessage(messageId, {
    │    status: "READ",
    │    readAt: notification.readAt
    │  })
    └─ Store.updateMessage triggers re-render
    ↓
[UI updates]
    ├─ Message bubble status icon changes
    ├─ Single check (✓) → Double check blue (✓✓)
    └─ Time updates if readAt provided
```

### In MessageBubble Component:
```typescript
const renderStatusIcon = () => {
  switch (message.status) {
    case "READ":      return <CheckCheck className="text-primary-500" />
    case "DELIVERED": return <CheckCheck className="text-slate-400" />
    case "SENT":      return <Check className="text-slate-400" />
    default:          return <Clock className="text-slate-400" />
  }
}
```

---

## Step 5: Typing Indicators

### Flow:

```
User starts typing in MessageInput
    ↓
[MessageInput.onTypingChange triggered]
    ├─ Track: typing state changes
    ├─ Debounce timer: 2 seconds
    ├─ Call: onTypingChange(recipientId, isTyping)
    └─ (Debounce prevents too many events)
    ↓
[MessagesPage.handleTypingChange]
    ├─ User is typing → setTyping(recipientId, true)
    ├─ (WebSocket sends to backend)
    └─ After 2s inactivity → setTyping(recipientId, false)
    ↓
[sendTypingIndicator(recipientId, isTyping)]
    ├─ Check: WebSocket connected?
    ├─ YES → Publish to /app/chat.typing
    │        Body: { recipientId, typing: true }
    └─ NO → Return false (silently fail)
    ↓
[Backend broadcasts]
    └─ Send to recipient's /user/queue/typing
       with: { senderId, typing: true }
    ↓
[WebSocket receives]
    ├─ Endpoint: /user/queue/typing
    ├─ Data: TypingNotification { senderId, typing }
    └─ Callback: callbacks.onTyping(notification)
    ↓
[useWebSocket.handleTyping]
    └─ setUserTyping(senderId, isTyping)
         └─ Store.typingUsers Map[senderId] = timestamp
    ↓
[Store updates]
    └─ messageStore.typingUsers = Map { 
           senderId: { odinguserId, timestamp }
       }
       * Note: Field name has typo "odinguserId" should be "typingUserId"
    ↓
[ChatWindow component]
    ├─ Watches messageStore.typingUsers
    ├─ Checks if any users typing in active conversation
    └─ Renders: "{User} is typing..."
       with animated dots: typing... ••• 
```

### Code Reference:
- **[components/messaging/MessageInput.tsx](components/messaging/MessageInput.tsx)** - Tracks typing
- **[components/messaging/ChatWindow.tsx](components/messaging/ChatWindow.tsx)** - Displays typing indicator
- **[app/student/messages/page.tsx](app/student/messages/page.tsx)** - Connects flows

---

## Step 6: Data Flow Summary - Complete Journey

### Sending Message Flow:
```
User Type & Send
    ↓
MessagesPage.handleSendMessage()
    ├─ Check activeConversationId exists
    ├─ Is new conversation? Yes → Add to conversationList
    └─ Send via WebSocket (if connected) OR HTTP
         ├─ WebSocket: sendSocketMessage() → /app/chat.send
         └─ HTTP: POST /messages
    ↓
CASE 1 - WebSocket:
    ├─ Backend receives → Saves DB
    ├─ Backend broadcasts to sender (echo) 
    ├─ Backend broadcasts to recipient
    └─ Frontend handleMessage processes (may be noticeable delay)
    ↓
CASE 2 - HTTP Fallback:
    ├─ useSendMessage.onSuccess fires immediately
    ├─ addMessage() to store
    ├─ UI updates immediately
    └─ Later: WebSocket might also receive echo
         (but message already in store, so duplicates avoided)
```

### Receiving Message Flow:
```
Backend processes message from other user
    ↓
Broadcasts via WebSocket /user/queue/messages
    ↓
handleMessage callback triggered
    ├─ Is for active conversation?
    │  ├─ YES → Add to messages array (display in chat)
    │  └─ NO → Only update conversation list preview
    ├─ Update conversation metadata
    ├─ Update unreadCount
    └─ Invalidate queries for UI refresh
    ↓
UI component receives updated store
    ├─ ChatWindow renders new message
    ├─ ConversationList updates preview
    └─ Unread badge updates
    ↓
[Auto-read receipt if conversation open]
    ├─ User sees message
    ├─ Auto-send read receipt
    ├─ Backend marks message READ
    ├─ Broadcasts read receipt back
    └─ UI updates status icons
```

---

## Key Components Breakdown

### 1. **MessagesPage** [app/student/messages/page.tsx]
- **Role**: Main orchestrator
- **Responsibilities**:
  - Manage activeConversationId
  - Route between conversation list and chat window
  - Handle send message logic (WebSocket vs HTTP)
  - Trigger read receipt when opening conversation
  - Manage pending conversation for new chats
- **Key State**:
  - `activeConversationId` - Which conversation is open
  - `pendingConversationUser` - For first message in new conversation
  - `conversations` - List from store
  - `messages` - Messages for active conversation

### 2. **useWebSocket Hook** [hookes/useWebSocket.ts]
- **Role**: Real-time connection manager
- **Responsibilities**:
  - Establish STOMP/WebSocket connection
  - Register callbacks for message/typing/receipts
  - Manage connection lifecycle
  - Export methods: `sendMessage()`, `setTyping()`, `markMessageRead()`
- **Key State**:
  - `isConnected` - Connection status
  - Refs to latest values for callbacks
- **Returns**:
  ```typescript
  {
    isConnected: boolean,
    sendMessage: (recipientId, content, type) => boolean,
    setTyping: (recipientId, isTyping) => boolean,
    markMessageRead: (messageId) => boolean
  }
  ```

### 3. **useMessaging Hook** [hookes/useMessaging.ts]
- **Role**: Server sync manager using React Query
- **Exports Functions**:
  - `useConversations()` - Query for conversation list
  - `useMessages(otherUserId)` - Infinite query for messages
  - `useSendMessage()` - Mutation for HTTP send (fallback)
  - `useMarkAsRead()` - Single message read
  - `useMarkConversationAsRead()` - Entire thread read
- **Key**: Handles HTTP communication when WebSocket unavailable

### 4. **Message Store** [stores/message.store.ts]
- **Role**: Client-side state management using Zustand
- **State**:
  ```typescript
  conversations: ConversationResponse[]
  messages: MessageResponse[]
  activeConversationId: number | null
  typingUsers: Map<number, TypingUser>  // Who's typing
  totalUnreadCount: number
  ```
- **Key Actions**:
  - `addMessage()` - Add to messages array
  - `updateMessage()` - Update status/content
  - `setUserTyping()` - Add/remove from typing map
  - `updateConversation()` - Update preview/unread

### 5. **ChatWindow** [components/messaging/ChatWindow.tsx]
- **Role**: Message display & interaction
- **Displays**:
  - Messages grouped by date
  - Message bubbles with status icons
  - MessageInput for typing
  - Typing indicators
  - Load more button for infinite scroll
- **Props**:
  - `messages`: MessageResponse[]
  - `currentUserId`: number
  - `onSendMessage`: (content) => void

### 6. **MessageBubble** [components/messaging/MessageBubble.tsx]
- **Role**: Individual message rendering
- **Shows**:
  - Message content
  - Sender/receiver side (chat bubble positioning)
  - Status icons (clock, ✓, ✓✓)
  - Timestamps
  - Attachments (images, files, links)
  - Read time if available

---

## Data Types Flow

### MessageResponse (Core Data Model)
```typescript
interface MessageResponse {
  id: number                          // Unique ID
  senderId: number                    // Who sent
  recipientId: number                 // Who receives
  content: string                     // Message text
  type: "TEXT" | "IMAGE" | "FILE"    // Message type
  status: "PENDING" | "SENT" | "DELIVERED" | "READ"
  createdAt: string                   // ISO timestamp
  readAt?: string                     // When read (if READ)
  attachmentUrl?: string              // For images/files
  attachmentName?: string
}
```

### ConversationResponse (List Item)
```typescript
interface ConversationResponse {
  participantId: number               // The other user
  participant: {
    userId: number
    firstName: string
    lastName: string
    profilePictureUrl?: string
  }
  lastMessage: string                 // Latest message
  lastMessageAt: string               // Time of last message
  unreadCount: number                 // How many unread
}
```

### WebSocket Events Exchanged
```
CLIENT → SERVER:
├─ /app/chat.send       (ChatMessageRequest)
├─ /app/chat.typing     (TypingIndicator)
└─ /app/chat.read       (ReadReceiptRequest)

SERVER → CLIENT:
├─ /user/queue/messages      (MessageResponse)
├─ /user/queue/typing        (TypingNotification)
└─ /user/queue/read-receipts (ReadReceiptNotification)
```

---

## Common Issues & Debugging

### Issue 1: Messages Not Appearing in Chat View
**Symptoms**: Message sent (✓ icon shows) but not visible in active chat
**Root Causes**:
1. `activeConversationId` not set when message received
   - Check: console log "[WS] Is for active conversation: false"
   - Solution: Click on conversation to set activeConversationId
2. WebSocket not connected
   - Check: console log "[WS] WebSocket connected successfully"
   - Verify: Network tab shows /chat connection

**Debug Steps**:
```javascript
// In console:
// Check store state
console.log(messageStore.activeConversationId)
console.log(messageStore.messages)

// Check WebSocket state
console.log(messageStore.typingUsers)

// Send test message and watch logs:
// [WS] Active conversation updated: 5
// [WS] Is for active conversation: true
// [WS] Adding message to active chat
```

### Issue 2: Read Receipts Not Showing (✓✓)
**Symptoms**: Messages stay with single check (✓) instead of double (✓✓)
**Root Causes**:
1. markConversationAsRead not triggered
   - Need to ensure effect runs when opening conversation
2. Read receipt WebSocket not received
   - Backend not sending receipts
3. Message status not updating in store
   - updateMessage not working

**Debug Steps**:
```javascript
// Watch for receipt sent:
console.log("[WS] Message published successfully")

// Watch for receipt received:
console.log("[WS] onReadReceipt")

// Check store
let msg = messageStore.messages.find(m => m.id === 123)
console.log(msg.status)  // Should be "READ"
```

### Issue 3: WebSocket Disconnects Frequently
**Symptoms**: Connection lost messages in console
**Root Causes**:
1. Token expired - need re-authentication
2. Network unstable
3. Backend WebSocket server issue

**Debug Steps**:
```javascript
// Check reconnection attempts
// Look for: "[WS] Attempting WebSocket connection..."
// Count how many times it tries

// Check error messages
// Look for: "[WS] WebSocket error"

// Verify token
const token = tokenStorage.getAccess()
console.log(token.substring(0, 50) + "...")
```

### Issue 4: Duplicate Messages Appear
**Symptoms**: Same message shown twice
**Root Causes**:
1. Both WebSocket AND HTTP sent same message
2. handleMessage called twice for same message
3. Store addMessage not checking for duplicates

**Debug Steps**:
```javascript
// Check message IDs
messageStore.messages.forEach(m => console.log(m.id, m.content))

// Check for duplicates
const ids = new Set()
messageStore.messages.forEach(m => {
  if (ids.has(m.id)) console.warn("Duplicate:", m.id)
  ids.add(m.id)
})
```

---

## Performance Characteristics

### Message Load Times:
| Scenario | Time | Reason |
|----------|------|--------|
| Send via WS | 50-200ms | Network + backend processing |
| Send via HTTP | 100-300ms | HTTP request + response |
| Receive WS | 20-100ms | Just network transfer |
| Display in UI | <10ms | React re-render |

### Optimization Tips:
1. **Lazy load messages** - Use infinite scroll for old messages
2. **Debounce typing** - Already implemented (2s timeout)
3. **Memoize components** - Prevent unnecessary re-renders
4. **Virtual scrolling** - For large message lists

---

## Testing the System

### Test 1: Send and Receive Message
```
1. Open two browser tabs (different users)
2. User A → Messages → Start conversation with User B
3. User A types: "Hello from A"
4. User A clicks Send

Verify in User A console:
  "[MessagesPage] handleSendMessage called"
  "[WS] Message published successfully"

Verify in User B console:
  "[WS] ===== INCOMING MESSAGE ====="
  "[WS] Adding message to active chat"

Verify in User B UI:
  Message appears in ChatWindow
  Auto-scroll to bottom
  Sends read receipt
```

### Test 2: Read Receipts
```
1. User A sends message
2. User B receives but NOT in that chat
3. User B clicks on conversation with User A

Verify:
  User A console: Read receipt received
  User A UI: Message status changes ✓ → ✓✓
  User B console: "[Store] setActiveConversation: 5"
```

### Test 3: Typing Indicators
```
1. User B opens chat with User A
2. User A starts typing in input field

Verify in User B UI:
  "A is typing..." appears below chat
  After 2s inactivity: disappears

Verify in consoles:
  A: "[WS] Message published successfully" (typing message)
  B: "[WS] ===== INCOMING MESSAGE =====" (not needed for typing)
     Actually typing goes to /user/queue/typing, not messages
```

### Test 4: WebSocket Disconnect & Reconnect
```
1. Open DevTools → Network
2. Filter: WS
3. Close WebSocket connection manually
4. Send message

Verify:
  Frontend falls back to HTTP
  Message still sends successfully
  Connection auto-restarts
```

---

## Summary of Key Takeaways

✅ **Architecture**: Hybrid WebSocket (real-time) + HTTP (fallback) + Zustand (state)

✅ **Message Flow**: 
- Send → Backend → Broadcast to recipient → Store updates → UI renders

✅ **Real-Time Features**:
- Messages: via /user/queue/messages
- Typing: via /user/queue/typing
- Read Receipts: via /user/queue/read-receipts

✅ **State Management**:
- Active conversation ID determines what appears
- Store methods like addMessage, updateMessage trigger re-renders
- Refs in WebSocket hook keep latest values

✅ **Fallback Strategy**:
- WebSocket unavailable? Use HTTP
- Prevents message loss
- HTTP success immediately updates store
- WebSocket echo might come later but handl

ed as duplicate

✅ **Key Gotchas**:
- Message only displays if `activeConversationId` matches sender/recipient
- Typing indicator has typo in store: `odinguserId` instead of `typingUserId`
- Read receipts need explicit action (opening conversation or sending receipt)
- WebSocket connection requires valid JWT token
