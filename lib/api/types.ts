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