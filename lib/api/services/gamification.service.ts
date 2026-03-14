import { apiClient } from '../api-client'
import {
    UserScoreResponse,
    UserPublicProfileResponse,
    LeaderboardEntryResponse,
    UserBadgeResponse,
    BadgeResponse,
    AddPointsRequest,
    CreateBadgeRequest,
} from '../types'

const BASE_URL = '/gamification'

export const gamificationService = {
    // ─── User Score ──────────────────────────────────────────────────────────

    /** Get current user's score */
    getCurrentUserScore: () =>
        apiClient
            .get<UserScoreResponse>(`${BASE_URL}/score`)
            .then((r) => r.data),

    /** Get a user's score by ID */
    getUserScore: (userId: number) =>
        apiClient
            .get<UserScoreResponse>(`${BASE_URL}/score/${userId}`)
            .then((r) => r.data),

    /** Get a user's public profile */
    getUserProfile: (userId: number) =>
        apiClient
            .get<UserPublicProfileResponse>(`${BASE_URL}/profile/${userId}`)
            .then((r) => r.data),

    /** Add points to a user */
    addPoints: (userId: number, data: AddPointsRequest) =>
        apiClient
            .post<UserScoreResponse>(`${BASE_URL}/points?userId=${userId}`, data)
            .then((r) => r.data),

    // ─── Leaderboard ─────────────────────────────────────────────────────────

    /** Get global leaderboard */
    getGlobalLeaderboard: (limit: number = 100) =>
        apiClient
            .get<LeaderboardEntryResponse[]>(`${BASE_URL}/leaderboard/global`, {
                params: { limit },
            })
            .then((r) => r.data),

    /** Get weekly leaderboard */
    getWeeklyLeaderboard: (limit: number = 50) =>
        apiClient
            .get<LeaderboardEntryResponse[]>(`${BASE_URL}/leaderboard/weekly`, {
                params: { limit },
            })
            .then((r) => r.data),

    /** Get user's rank */
    getUserRank: (userId: number) =>
        apiClient
            .get<number>(`${BASE_URL}/leaderboard/rank/${userId}`)
            .then((r) => r.data),

    /** Get user's rank percentile */
    getUserRankPercentage: (userId: number) =>
        apiClient
            .get<number>(`${BASE_URL}/leaderboard/rank-percentage/${userId}`)
            .then((r) => r.data),

    // ─── User Badges ─────────────────────────────────────────────────────────

    /** Get all badges earned by a user */
    getUserBadges: (userId: number) =>
        apiClient
            .get<UserBadgeResponse[]>(`${BASE_URL}/user-badges/${userId}`)
            .then((r) => r.data),

    /** Get count of badges earned by a user */
    getUserBadgesCount: (userId: number) =>
        apiClient
            .get<number>(`${BASE_URL}/user-badges/${userId}/count`)
            .then((r) => r.data),

    /** Check if user has a specific badge */
    hasUserBadge: (userId: number, badgeId: number) =>
        apiClient
            .get<boolean>(`${BASE_URL}/user-badges/${userId}/has/${badgeId}`)
            .then((r) => r.data),

    /** Award a badge to a user */
    awardBadge: (userId: number, badgeId: number) =>
        apiClient.post(`${BASE_URL}/user-badges/${userId}/award/${badgeId}`),

    // ─── Badge Catalog ───────────────────────────────────────────────────────

    /** Get a specific badge by ID */
    getBadgeById: (badgeId: number) =>
        apiClient
            .get<BadgeResponse>(`${BASE_URL}/badges/${badgeId}`)
            .then((r) => r.data),

    /** Get a badge by code */
    getBadgeByCode: (code: string) =>
        apiClient
            .get<BadgeResponse>(`${BASE_URL}/badges/code/${code}`)
            .then((r) => r.data),

    /** Get all badges */
    getAllBadges: () =>
        apiClient
            .get<BadgeResponse[]>(`${BASE_URL}/badges`)
            .then((r) => r.data),

    /** Get all active badges */
    getActiveBadges: () =>
        apiClient
            .get<BadgeResponse[]>(`${BASE_URL}/badges/active`)
            .then((r) => r.data),

    /** Create a new badge (admin) */
    createBadge: (data: CreateBadgeRequest) =>
        apiClient
            .post<BadgeResponse>(`${BASE_URL}/badges`, data)
            .then((r) => r.data),

    /** Update a badge (admin) */
    updateBadge: (badgeId: number, data: CreateBadgeRequest) =>
        apiClient
            .put<BadgeResponse>(`${BASE_URL}/badges/${badgeId}`, data)
            .then((r) => r.data),

    /** Delete a badge (admin) */
    deleteBadge: (badgeId: number) =>
        apiClient.delete(`${BASE_URL}/badges/${badgeId}`),
}
