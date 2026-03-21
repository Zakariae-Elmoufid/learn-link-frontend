# Bug Analysis: New Messages Not Appearing + Duplicate Key Error

## Problem 1: Message Disappears When Opening Conversation

### Scenario
```
Time 09:00  - User A: NOT in messages page
Time 09:05  - User B sends message to User A
Time 09:10  - User A navigates to /messages page
Time 09:11  - Message appears in conversation list ✅ with unread badge ✅
Time 09:12  - User A clicks conversation
Time 09:13  - ChatWindow opens BUT new message is MISSING ❌
```

### Root Cause
The issue is in the **flow of events**:

```
1. Message arrives via WebSocket
   └─ handleMessage() in useWebSocket
   └─ Check: isForActiveConversation? 
      └─ activeConversationId was null (user not in conv)
      └─ Message NOT added to store.messages ❌
   └─ BUT: Conversation preview IS updated ✅

2. User clicks on conversation
   └─ MessagesPage: setActiveConversation(participantId)
   └─ activeConversationId = 11 (now set)
   └─ useMessages(11) query triggers
   └─ API: GET /messages/conversation/11?page=0
   └─ Returns messages from database

3. BUT...
   └─ The new message from WebSocket:
      ├─ Arrived AFTER the user was offline/not-in-conv
      ├─ Might not be in database yet
      ├─ Or there's a race condition
      └─ Message is missing from ChatWindow ❌
```

### Why This Happens
1. **Race condition**: When user clicks conversation:
   - `store.setMessages([])` is called immediately (line 47 in useMessages)
   - This CLEARS any messages already in store
   - Then API query fetches messages

2. **Offline message timing**: 
   - If message sent while user offline, backend might:
     - Save to database (slow)
     - Send via WebSocket (instant)
   - When ChatWindow opens, API response might not include it yet

3. **Missing retroactive addition**:
   - handleMessage has logic: "if NOT activeConversation, don't add"
   - But when activeConversation changes, it doesn't fetch those pending messages

---

## Problem 2: Duplicate Key Error (React Warning)

### Error Message
```
Encountered two children with the same key `386`
```

### Root Cause - Likely Scenarios

**Scenario A: Store has duplicates**
```javascript
store.messages = [
  { id: 386, content: "Hi", senderId: 5 },
  { id: 386, content: "Hi", senderId: 5 },  // Duplicate!
]

// When rendered:
{messages.map(m => <Message key={m.id} />)}
//                              ^^^^^ same key twice = error!
```

**Scenario B: WebSocket message added twice**
```typescript
// Message from WebSocket
handleMessage(msg)

// Same message also:
// 1. Added via activeConversation change
// 2. Added via store.setMessages(API result)
// 3. Was already in store AND API returns it
// = Same message with same ID appears twice
```

**Scenario C: Timestamps causing key conflicts**
```javascript
// If message.id was based on something mutable
// (though code uses numeric IDs so less likely)
```

---

## The Real Issue: setMessages Clears Then Loads

```typescript
// From useMessages hook (hookes/useMessaging.ts line 48-51)
useEffect(() => {
  setMessages([])  // ← CLEARS everything!
}, [otherUserId, setMessages])

// Then later:
useEffect(() => {
  if (query.data) {
    const allMessages = query.data.pages
      .flatMap((page) => page.content)
      .reverse()
    setMessages(allMessages)  // ← REPLACES with API data
  }
}, [query.data, setMessages])
```

**Problem**: When switching conversations, `setMessages([])` clears the array, which:
1. Removes any WebSocket messages waiting to be displayed
2. Then waits for API to load
3. If API is slow, gap exists where no messages shown
4. If WebSocket message added AFTER setMessages but BEFORE API response:
   - Message added to empty array
   - Then API response overwrites with []
   - Message lost!

---

## Solutions

### Solution 1: Merge Messages Instead of Replacing

**Current (Bad)**:
```typescript
const allMessages = query.data.pages
  .flatMap((page) => page.content)
  .reverse()
setMessages(allMessages)  // Replaces everything
```

**Fixed (Good)**:
```typescript
// Only add messages that aren't already in store
const apiMessages = query.data.pages
  .flatMap((page) => page.content)
  .reverse()

set((state) => {
  const existingIds = new Set(state.messages.map(m => m.id))
  const newMessages = apiMessages.filter(m => !existingIds.has(m.id))
  
  // Combine: API (old) + store (new WebSocket messages)
  return {
    messages: [...newMessages, ...state.messages]
  }
})
```

### Solution 2: Don't Clear on Conversation Change

**Current (Bad)**:
```typescript
useEffect(() => {
  setMessages([])  // ← Clears everything
}, [otherUserId, setMessages])
```

**Fixed (Good)**:
```typescript
useEffect(() => {
  // Don't clear immediately
  // Only clear if there's an actual error
  if (!otherUserId) {
    setMessages([])
  }
}, [otherUserId, setMessages])
```

### Solution 3: Send Read Receipts Retroactively

When user opens a conversation, send read receipts for ANY messages received while offline:

```typescript
// In MessagesPage - when activeConversationId changes
useEffect(() => {
  if (!activeConversationId) return
  
  // Get messages from OTHER user that aren't READ yet
  const unreadFromThisUser = messages.filter(
    m => m.senderId === activeConversationId && m.status !== 'READ'
  )
  
  // Send read receipt for each
  unreadFromThisUser.forEach(m => {
    markMessageRead(m.id)
  })
}, [activeConversationId, messages])
```

### Solution 4: Fix React Key Issue

Ensure messages array has no duplicates before rendering:

```typescript
// In ChatWindow - deduplicate before grouping
const uniqueMessages = Array.from(
  new Map(messages.map(m => [m.id, m])).values()
)

const groupedMessages = [...]
  .reduce((acc, msg) => {
    // grouping logic using uniqueMessages
  })
```

---

## Recommended Implementation Path

### Step 1: Fix Store (Immediate)
Ensure `setMessages` uses merge instead of replace:
```typescript
// In message.store.ts
setMessages: (messages) => {
  set((state) => {
    const existingIds = new Set(state.messages.map(m => m.id))
    const uniqueNew = messages.filter(m => !existingIds.has(m.id))
    
    // Merge: new API messages + existing WebSocket messages
    return {
      messages: [...uniqueNew, ...state.messages]
    }
  })
}
```

### Step 2: Fix useMessages (Medium)
Don't clear messages on conversation change:
```typescript
// In useMessaging.ts - useMessages hook
useEffect(() => {
  if (!otherUserId) {
    setMessages([])
  }
  // Don't clear if otherUserId just changed - it might clear WebSocket messages
}, [otherUserId, setMessages])
```

### Step 3: Add Retroactive Read Receipts (Long-term)
When opening conversation, mark pending messages as read:
```typescript
// In MessagesPage
useEffect(() => {
  if (!activeConversationId) return
  
  const pendingMessages = messages.filter(
    m => m.senderId === activeConversationId && m.status !== 'READ'
  )
  
  pendingMessages.forEach(m => markMessageRead(m.id))
}, [activeConversationId, messages])
```

### Step 4: Deduplicate in View (Quick Fix)
In ChatWindow, remove duplicates:
```typescript
const seenIds = new Set<number>()
const uniqueMessages = messages.filter(m => {
  if (seenIds.has(m.id)) return false
  seenIds.add(m.id)
  return true
})

// Then use uniqueMessages for grouping and rendering
```

---

## Testing After Fixes

```
Test Case 1: Message while offline
1. User A signs in but NOT in messages
2. User B sends message
3. User A goes to /messages page
   ✅ Should see message in list with unread count
4. User A clicks conversation
   ✅ Message should appear in chat (not disappear!)
5. Read receipt should auto-send
   ✅ Check mark should change ✓ → ✓✓

Test Case 2: Multiple conversations
1. Multiple users send messages
2. User A clicks each conversation
   ✅ No duplicate key errors in console
   ✅ Each message appears exactly once

Test Case 3: Fast clicking
1. User A rapidly clicks conversations (User B, C, D)
2. No messages should disappear
3. No duplicate key errors
```

---

## Key Takeaway

The root issue is **state management race conditions**:
1. Store clears messages before new data arrives
2. WebSocket messages added go missing when API overwrites
3. No deduplication on merge

**Fix: Always merge and deduplicate**, never replace!
