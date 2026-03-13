// ─── Generic Wrappers ───────────────────────────────────────────────────────

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}

export interface ApiError {
    message: string
    status: number
    errors?: Record<string, string[]>
}
// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
    email: string
    username: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}
export interface AuthUser {
    id: number
    email: string
    username: string
    active: boolean
    emailVerified: boolean
    role: 'STUDENT' | 'EDUCATOR' | 'MODERATOR' | 'ADMIN'
}
export interface AuthResponse {
    access_token: string
    refresh_token: string
    token_type: string
    user: AuthUser
}

export interface RefreshTokenRequest {
    refresh_token: string
}
// ─── User / Profile ──────────────────────────────────────────────────────────
    export interface UserProfileResponse {
    id: number
    userId: number
    username: string
    email: string
    firstName: string
    lastName: string
    bio: string
        academicLevel: string
        profilePictureUrl?: string
        studentSubjects: Subject[]
    coverUrl?: string
    subjectIds: number[]
    postsCount: number
    connectionsCount: number
    badgesCount: number
    points: number
    level: number
    createdAt: string
}

export interface UserProfileCreate {
    bio?: string
    firstName: string
    lastName: string
    academicLevel: string
    studentSubjectIds: number[]
}

export interface Subject {
    id: number
    name: string
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'LINK'
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'

export interface MessageResponse {
    id: number
    senderId: number
    recipientId: number
    content: string
    messageType: MessageType
    status: MessageStatus
    attachmentUrl?: string
    attachmentName?: string
    readAt?: string
    createdAt: string
    updatedAt: string
}

export interface ConversationResponse {
    participantId: number
    participant: UserProfileResponse
    participantAvatar?: string
    lastMessage: string
    lastMessageAt: string
    unreadCount: number
}

export interface SendMessageRequest {
    recipientId: number
    content: string
    type?: MessageType
    attachmentUrl?: string
    attachmentName?: string
}

export interface ChatMessageRequest {
    recipientId: number
    content: string
    type?: MessageType
    attachmentUrl?: string
    attachmentName?: string
}

export interface TypingIndicator {
    recipientId: number
    typing: boolean
}

export interface TypingNotification {
    senderId: number
    typing: boolean
    timestamp: string
}

export interface ReadReceiptRequest {
    messageId: number
}

export interface ReadReceiptNotification {
    messageId: number
    readerId: number
    readAt: string
}

export interface MessagesPageResponse {
    content: MessageResponse[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

// ─── Matching ────────────────────────────────────────────────────────────────

export interface MatchSuggestion {
    userId: number
    firstName: string
    lastName: string
    profilePictureUrl?: string
    bio?: string
    academicLevel: string
    compatibilityScore: number
    commonSubjects: string[]
    subjectMatchPercentage: number
    levelMatchPercentage: number
    hasPendingRequest: boolean
    isConnected: boolean
}

export interface CompatibilityResponse {
    userId: number
    compatibilityScore: number
    message: string
}

// ─── Connections ─────────────────────────────────────────────────────────────

export type ConnectionStatus = 'ACTIVE' | 'BLOCKED'
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export interface ConnectionRequest {
    receiverId: number
    message?: string
}

export interface ConnectionRequestResponse {
    id: number
    senderId: number
    senderFirstName: string
    senderLastName: string
    senderProfilePictureUrl?: string
    receiverId: number
    receiverFirstName: string
    receiverLastName: string
    receiverProfilePictureUrl?: string
    message?: string
    status: RequestStatus
    compatibilityScore: number
    createdAt: string
    updatedAt: string
}

export interface ConnectionResponse {
    id: number
    connectedUserId: number
    firstName: string
    lastName: string
    profilePictureUrl?: string
    bio?: string
    academicLevel: string
    compatibilityScore: number
    status: ConnectionStatus
    connectedAt: string
}

export interface CountResponse {
    count: number
}

export interface ConnectionCheckResponse {
    connected: boolean
}

// ─── Study Groups ────────────────────────────────────────────────────────────

export type GroupStatus = 'ACTIVE' | 'FULL' | 'ARCHIVED'
export type GroupRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'REMOVED'

export interface CreateGroupRequest {
    name: string
    description?: string
    subjectId?: number
    maxMembers?: number
    isPublic?: boolean
    coverImageUrl?: string
}

export interface UpdateGroupRequest {
    name?: string
    description?: string
    maxMembers?: number
    isPublic?: boolean
    coverImageUrl?: string
}

export interface GroupMember {
    userId: number
    firstName: string
    lastName: string
    profilePictureUrl?: string
    role: GroupRole
    status: MembershipStatus
    joinedAt?: string
}

export interface StudyGroupResponse {
    id: number
    name: string
    description?: string
    subjectId?: number
    subjectName?: string
    ownerId: number
    ownerName: string
    maxMembers: number
    currentMemberCount: number
    status: GroupStatus
    isPublic: boolean
    coverImageUrl?: string
    createdAt: string
    isMember: boolean
    isAdmin: boolean
    isOwner: boolean
    hasPendingRequest: boolean
    members?: GroupMember[]
}

// ─── Community / Posts ───────────────────────────────────────────────────────

export type PostType = 'SUMMARY' | 'TUTORIAL' | 'DISCUSSION'

export type PostCategory =
    | 'MATHEMATICS'
    | 'SCIENCE'
    | 'LANGUAGES'
    | 'PROGRAMMING'
    | 'HISTORY'
    | 'LITERATURE'
    | 'PHYSICS'
    | 'CHEMISTRY'
    | 'BIOLOGY'
    | 'ECONOMICS'
    | 'OTHER'

export interface CreatePostRequest {
    title: string
    content: string
    type: PostType
    category: PostCategory
}

export interface UpdatePostRequest {
    title: string
    content: string
    category: PostCategory
}

export interface PostResponse {
    id: number
    userId: number
    title: string
    content: string
    type: PostType
    category: PostCategory
    viewCount: number
    likesCount: number
    commentsCount: number
    createdAt: string
    updatedAt: string
    likedByCurrentUser: boolean
}

export interface PostSearchParams {
    keyword?: string
    category?: PostCategory
    type?: PostType
    page?: number
    size?: number
}