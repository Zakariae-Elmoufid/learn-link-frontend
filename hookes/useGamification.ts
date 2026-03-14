import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationService } from '@/lib/api/services'
import { UserScoreResponse, AddPointsRequest, CreateBadgeRequest } from '@/lib/api/types'

const QUERY_KEYS = {
    all: ['gamification'] as const,
    scores: () => [...QUERY_KEYS.all, 'scores'] as const,
    score: (userId?: number) => [...QUERY_KEYS.scores(), userId] as const,
    currentScore: () => [...QUERY_KEYS.scores(), 'current'] as const,
    profiles: () => [...QUERY_KEYS.all, 'profiles'] as const,
    profile: (userId: number) => [...QUERY_KEYS.profiles(), userId] as const,
    leaderboards: () => [...QUERY_KEYS.all, 'leaderboards'] as const,
    globalLeaderboard: (limit: number) => [...QUERY_KEYS.leaderboards(), 'global', limit] as const,
    weeklyLeaderboard: (limit: number) => [...QUERY_KEYS.leaderboards(), 'weekly', limit] as const,
    ranks: () => [...QUERY_KEYS.all, 'ranks'] as const,
    rank: (userId: number) => [...QUERY_KEYS.ranks(), userId] as const,
    rankPercentage: (userId: number) => [...QUERY_KEYS.ranks(), 'percentage', userId] as const,
    badges: () => [...QUERY_KEYS.all, 'badges'] as const,
    badgeCatalog: () => [...QUERY_KEYS.badges(), 'catalog'] as const,
    badge: (badgeId: number) => [...QUERY_KEYS.badgeCatalog(), badgeId] as const,
    badgeByCode: (code: string) => [...QUERY_KEYS.badgeCatalog(), 'code', code] as const,
    activeBadges: () => [...QUERY_KEYS.badgeCatalog(), 'active'] as const,
    userBadges: () => [...QUERY_KEYS.badges(), 'user'] as const,
    userBadgesForUser: (userId: number) => [...QUERY_KEYS.userBadges(), userId] as const,
    userBadgesCount: (userId: number) => [...QUERY_KEYS.userBadges(), userId, 'count'] as const,
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const useCurrentUserScore = () => {
    return useQuery({
        queryKey: QUERY_KEYS.currentScore(),
        queryFn: () => gamificationService.getCurrentUserScore(),
    })
}

export const useUserScore = (userId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.score(userId),
        queryFn: () => gamificationService.getUserScore(userId!),
        enabled: !!userId,
    })
}

export const useUserProfile = (userId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.profile(userId!),
        queryFn: () => gamificationService.getUserProfile(userId!),
        enabled: !!userId,
    })
}

export const useGlobalLeaderboard = (limit: number = 100) => {
    return useQuery({
        queryKey: QUERY_KEYS.globalLeaderboard(limit),
        queryFn: () => gamificationService.getGlobalLeaderboard(limit),
    })
}

export const useWeeklyLeaderboard = (limit: number = 50) => {
    return useQuery({
        queryKey: QUERY_KEYS.weeklyLeaderboard(limit),
        queryFn: () => gamificationService.getWeeklyLeaderboard(limit),
    })
}

export const useUserRank = (userId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.rank(userId!),
        queryFn: () => gamificationService.getUserRank(userId!),
        enabled: !!userId,
    })
}

export const useUserRankPercentage = (userId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.rankPercentage(userId!),
        queryFn: () => gamificationService.getUserRankPercentage(userId!),
        enabled: !!userId,
    })
}

export const useUserBadges = (userId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.userBadgesForUser(userId!),
        queryFn: () => gamificationService.getUserBadges(userId!),
        enabled: !!userId,
    })
}

export const useUserBadgesCount = (userId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.userBadgesCount(userId!),
        queryFn: () => gamificationService.getUserBadgesCount(userId!),
        enabled: !!userId,
    })
}

export const useBadgeById = (badgeId: number | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.badge(badgeId!),
        queryFn: () => gamificationService.getBadgeById(badgeId!),
        enabled: !!badgeId,
    })
}

export const useBadgeByCode = (code: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.badgeByCode(code!),
        queryFn: () => gamificationService.getBadgeByCode(code!),
        enabled: !!code,
    })
}

export const useAllBadges = () => {
    return useQuery({
        queryKey: QUERY_KEYS.badgeCatalog(),
        queryFn: () => gamificationService.getAllBadges(),
    })
}

export const useActiveBadges = () => {
    return useQuery({
        queryKey: QUERY_KEYS.activeBadges(),
        queryFn: () => gamificationService.getActiveBadges(),
    })
}

export const useHasUserBadge = (userId: number | undefined, badgeId: number | undefined) => {
    return useQuery({
        queryKey: [QUERY_KEYS.userBadgesForUser(userId!), badgeId],
        queryFn: () => gamificationService.hasUserBadge(userId!, badgeId!),
        enabled: !!userId && !!badgeId,
    })
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export const useAddPoints = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, data }: { userId: number; data: AddPointsRequest }) =>
            gamificationService.addPoints(userId, data),
        onSuccess: (updatedScore, { userId }) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.score(userId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentScore() })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboards() })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ranks() })
            // Update cache
            queryClient.setQueryData(QUERY_KEYS.score(userId), updatedScore)
        },
    })
}

export const useAwardBadge = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, badgeId }: { userId: number; badgeId: number }) =>
            gamificationService.awardBadge(userId, badgeId),
        onSuccess: (_, { userId, badgeId }) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userBadgesForUser(userId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userBadgesCount(userId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile(userId) })
        },
    })
}

export const useCreateBadge = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateBadgeRequest) => gamificationService.createBadge(data),
        onSuccess: () => {
            // Invalidate badge catalogs
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badgeCatalog() })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeBadges() })
        },
    })
}

export const useUpdateBadge = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ badgeId, data }: { badgeId: number; data: CreateBadgeRequest }) =>
            gamificationService.updateBadge(badgeId, data),
        onSuccess: (updatedBadge) => {
            // Invalidate and update cache
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badgeCatalog() })
            queryClient.setQueryData(QUERY_KEYS.badge(updatedBadge.id), updatedBadge)
        },
    })
}

export const useDeleteBadge = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (badgeId: number) => gamificationService.deleteBadge(badgeId),
        onSuccess: (_, badgeId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badgeCatalog() })
            queryClient.removeQueries({ queryKey: QUERY_KEYS.badge(badgeId) })
        },
    })
}
