// ─── Generic Wrappers ───────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  active: boolean;
  emailVerified: boolean;
  role: "STUDENT" | "EDUCATOR" | "MODERATOR" | "ADMIN";
}
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}
// ─── User / Profile ──────────────────────────────────────────────────────────
export interface UserProfileResponse {
  id: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  academicLevel: string;
  profilePictureUrl?: string;
  studentSubjects: Subject[];
  coverUrl?: string;
  subjectIds: number[];
  postsCount: number;
  connectionsCount: number;
  badgesCount: number;
  points: number;
  level: number;
  createdAt: string;
}

export interface UserProfileCreate {
  bio?: string;
  firstName: string;
  lastName: string;
  academicLevel: string;
  studentSubjectIds: number[];
}

export interface Subject {
  id: number;
  name: string;
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export type MessageType = "TEXT" | "IMAGE" | "FILE" | "LINK";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface MessageResponse {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  attachmentUrl?: string;
  attachmentName?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  participantId: number;
  participant: UserProfileResponse;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SendMessageRequest {
  recipientId: number;
  content: string;
  type?: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ChatMessageRequest {
  recipientId: number;
  content: string;
  type?: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface TypingIndicator {
  recipientId: number;
  typing: boolean;
}

export interface TypingNotification {
  senderId: number;
  typing: boolean;
  timestamp: string;
}

export interface ReadReceiptRequest {
  messageId: number;
}

export interface ReadReceiptNotification {
  messageId: number;
  readerId: number;
  readAt: string;
}

export interface MessagesPageResponse {
  content: MessageResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ─── Matching ────────────────────────────────────────────────────────────────

export interface MatchSuggestion {
  userId: number;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  bio?: string;
  academicLevel: string;
  compatibilityScore: number;
  commonSubjects: string[];
  subjectMatchPercentage: number;
  levelMatchPercentage: number;
  hasPendingRequest: boolean;
  isConnected: boolean;
}

export interface CompatibilityResponse {
  userId: number;
  compatibilityScore: number;
  message: string;
}

// ─── Connections ─────────────────────────────────────────────────────────────

export type ConnectionStatus = "ACTIVE" | "BLOCKED";
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface ConnectionRequest {
  receiverId: number;
  message?: string;
}

export interface ConnectionRequestResponse {
  id: number;
  senderId: number;
  senderFirstName: string;
  senderLastName: string;
  senderProfilePictureUrl?: string;
  receiverId: number;
  receiverFirstName: string;
  receiverLastName: string;
  receiverProfilePictureUrl?: string;
  message?: string;
  status: RequestStatus;
  compatibilityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionResponse {
  id: number;
  connectedUserId: number;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  bio?: string;
  academicLevel: string;
  compatibilityScore: number;
  status: ConnectionStatus;
  connectedAt: string;
}

export interface CountResponse {
  count: number;
}

export interface ConnectionCheckResponse {
  connected: boolean;
}

// ─── Community / Posts ───────────────────────────────────────────────────────

export type PostType = "SUMMARY" | "TUTORIAL" | "DISCUSSION";

export type PostCategory =
  | "MATHEMATICS"
  | "SCIENCE"
  | "LANGUAGES"
  | "PROGRAMMING"
  | "HISTORY"
  | "LITERATURE"
  | "PHYSICS"
  | "CHEMISTRY"
  | "BIOLOGY"
  | "ECONOMICS"
  | "OTHER";

export interface CreatePostRequest {
  title: string;
  content: string;
  type: PostType;
  category: PostCategory;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  category: PostCategory;
}

export interface PostResponse {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: PostType;
  category: PostCategory;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  likedByCurrentUser: boolean;
}

export interface PostSearchParams {
  keyword?: string;
  category?: PostCategory;
  type?: PostType;
  page?: number;
  size?: number;
}

export interface PostCommentResponse {
  id: number;
  postId: number | null;
  answerId: number | null;
  userId: number;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddCommentRequest {
  content: string;
}

/** @deprecated Use AddCommentRequest */
export type CreatePostCommentRequest = AddCommentRequest;

// ─── Community / Questions & Answers ───────────────────────────────────────

export interface AskQuestionRequest {
  title: string;
  content: string;
}

export interface ProvideAnswerRequest {
  content: string;
}

export type VoteType = "UPVOTE" | "DOWNVOTE";

export interface AnswerResponse {
  id: number;
  questionId: number;
  userId: number;
  content: string;
  voteCount: number;
  upvoteCount: number;
  downvoteCount: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  votedByCurrentUser: boolean | null;
}

export interface QuestionResponse {
  id: number;
  userId: number;
  title: string;
  content: string;
  viewCount: number;
  isResolved: boolean;
  acceptedAnswerId: number | null;
  createdAt: string;
  updatedAt: string;
  answers: AnswerResponse[];
}

// ─── Planner ─────────────────────────────────────────────────────────────────

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TaskRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: TaskPriority;
  subject?: string;
  tags?: string[];
}

export interface TaskResponse {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
  completedAt?: string | null;
  subject?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

// ─── Gamification / Badges & Achievements ──────────────────────────────────

export interface UserScoreResponse {
  userId: number;
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  pointsForNextLevel: number;
  progressPercentage: number;
}

export interface BadgeEarned {
  badgeId: number;
  code: string;
  name: string;
  iconUrl: string;
  rarity: string;
  earnedAt: string;
}

export interface UserPublicProfileResponse {
  userId: number;
  username: string;
  level: number;
  totalPoints: number;
  rank: number;
  badgeCount: number;
  badges: BadgeEarned[];
}

export interface LeaderboardEntryResponse {
  userId: number;
  username: string;
  level: number;
  totalPoints: number;
  rank: number;
  badgeCount: number;
}

export interface UserBadgeResponse {
  badgeId: number;
  code: string;
  name: string;
  iconUrl: string;
  rarity: string;
  earnedAt: string;
}

export interface BadgeResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  type: string;
  rarity: string;
  pointsRequired: number;
  active: boolean;
  createdAt: string;
}

export interface AddPointsRequest {
  actionType: string;
  points: number;
  description?: string;
}

export interface CreateBadgeRequest {
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  type: string;
  rarity: string;
  pointsRequired: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalPoints: number;
  level: number;
  pointsForNextLevel: number;
  currentLevelPoints: number;
  totalBadgesEarned: number;
  activeConnections: number;
  totalPostsCreated: number;
  totalQuestionsAsked: number;
  totalAnswersProvided: number;
  totalCommentsCreated: number;
  questionsResolved: number;
  answersAccepted: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  description: string;
  createdAt: string;
  pointsEarned: number;
  badgeColor: string;
}

export interface ContentCreationStats {
  totalPostsCreated: number;
  totalQuestionsAsked: number;
  totalAnswersProvided: number;
  totalCommentsCreated: number;
  totalPostLikes: number;
  totalAnswersAccepted: number;
  questionsResolved: number;
  averageLikesPerPost: number;
  averageCommentsPerQuestion: number;
  engagementScore: number;
}

export interface StudentDashboardResponse {
  statistics: DashboardStats;
  recentActivities: RecentActivity[];
  contentCreationStats: ContentCreationStats;
}

export interface TopSubject {
  subject: string;
  count: number;
  percentage: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalPosts: number;
  totalQuestions: number;
  totalAnswers: number;
  totalComments: number;
  postsThisWeek: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalConnections: number;
  totalPointsAwarded: number;
  badgesEarned: number;
  topSubjects: TopSubject[];
  generatedAt: string;
}

export interface AdminUserResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLogin: string;
  totalPoints: number;
  level: number;
  bio?: string;
  profileImageUrl?: string;
  subjects?: string[];
  badgesEarned?: number;
  postCount?: number;
  questionCount?: number;
  answerCount?: number;
}

// ─── Moderators ──────────────────────────────────────────────────────────────

export interface ModeratorPermission {
  id: number;
  permission: string;
  description: string;
  assigned?: boolean;
}

export interface ModeratorResponse {
  currentPermissions: any;
  id: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedAt: string;
  permissions: ModeratorPermission[];
}

export interface ModeratorPermissionsResponse {
  moderatorId: number;
  currentPermissions: ModeratorPermission[];
  availablePermissions: string[];
}

export interface CreateModeratorRequest {
  userId: number;
  permissions: string[];
}

export interface UpdateModeratorPermissionsRequest {
  permissions: string[];
}

// ─── Admin Moderation ───────────────────────────────────────────────────────

export type ModerationContentType = "POST" | "QUESTION" | "ANSWER" | "COMMENT";
export type ModerationAction = "HIDDEN" | "RESTORED" | "PERMANENTLY_DELETED";

export interface AdminModerationContentItem {
  id: number;
  postId?: number;
  answerId?: number;
  userId: number;
  username: string;
  title?: string;
  content: string;
  category?: string;
  type?: string;
  viewCount?: number;
  likes?: number;
  likesCount?: number;
  comments?: number;
  hidden: boolean;
  hiddenBy?: number;
  hiddenByUsername?: string;
  hiddenAt?: string;
  hiddenReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ModerationLogItem {
  id: number;
  actionType: ModerationAction;
  targetType: ModerationContentType;
  contentId: number;
  moderatorId: number;
  moderatorUsername: string;
  reason?: string;
  createdAt: string;
}

export interface ModerationActionResponse {
  success: boolean;
  message: string;
  action: ModerationAction;
  targetId: number;
  targetType: ModerationContentType;
  reason?: string;
  performedBy: number;
  performedAt: string;
}

export interface ModerationReasonRequest {
  reason: string;
  notifyUser?: boolean;
}

export interface ModerationPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}
