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

export interface AuthResponse {
    access_token: string
    refresh_token: string
    token_type: string
}

export interface RefreshTokenRequest {
    refresh_token: string
}