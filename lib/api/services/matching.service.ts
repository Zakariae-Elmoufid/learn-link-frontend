import { apiClient } from '../api-client'
import { MatchSuggestion, CompatibilityResponse } from '../types'

export const matchingService = {
    /** Get personalized match suggestions */
    getSuggestions: (limit = 10) =>
        apiClient
            .get<MatchSuggestion[]>('/matching/suggestions', { params: { limit } })
            .then((r) => r.data),

    /** Get match suggestions filtered by subject */
    getSuggestionsBySubject: (subjectId: number, limit = 10) =>
        apiClient
            .get<MatchSuggestion[]>(`/matching/suggestions/subject/${subjectId}`, { params: { limit } })
            .then((r) => r.data),

    /** Get compatibility score with another user */
    getCompatibility: (otherUserId: number) =>
        apiClient
            .get<CompatibilityResponse>(`/matching/compatibility/${otherUserId}`)
            .then((r) => r.data),
}
