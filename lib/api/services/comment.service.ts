import { apiClient } from '../api-client'
import { AddCommentRequest, PageResponse, PostCommentResponse } from '../types'

const BASE_URL = '/community/comments'

export const commentService = {
    // ─── Post Comments ───────────────────────────────────────────────────────

    /** Get all comments for a post */
    getByPost: (postId: number) =>
        apiClient
            .get<PostCommentResponse[]>(`${BASE_URL}/post/${postId}`)
            .then((r) => r.data),

    /** Add a comment to a post */
    createForPost: (postId: number, data: AddCommentRequest) =>
        apiClient
            .post<PostCommentResponse>(`${BASE_URL}/post/${postId}`, data)
            .then((r) => r.data),

    // ─── Answer Comments ─────────────────────────────────────────────────────

    /** Get all comments for an answer */
    getByAnswer: (answerId: number) =>
        apiClient
            .get<PostCommentResponse[]>(`${BASE_URL}/answer/${answerId}`)
            .then((r) => r.data),

    /** Add a comment to an answer */
    createForAnswer: (answerId: number, data: AddCommentRequest) =>
        apiClient
            .post<PostCommentResponse>(`${BASE_URL}/answer/${answerId}`, data)
            .then((r) => r.data),

    // ─── Single Comment ──────────────────────────────────────────────────────

    /** Get a single comment by ID */
    getById: (commentId: number) =>
        apiClient
            .get<PostCommentResponse>(`${BASE_URL}/${commentId}`)
            .then((r) => r.data),

    /** Update a comment */
    update: (commentId: number, data: AddCommentRequest) =>
        apiClient
            .put<PostCommentResponse>(`${BASE_URL}/${commentId}`, data)
            .then((r) => r.data),

    /** Delete a comment */
    delete: (commentId: number) =>
        apiClient.delete(`${BASE_URL}/${commentId}`),

    // ─── User Comments ───────────────────────────────────────────────────────

    /** Get comments by user with pagination */
    getByUser: (userId: number, page = 0, size = 20) =>
        apiClient
            .get<PageResponse<PostCommentResponse>>(`${BASE_URL}/user/${userId}`, {
                params: { page, size },
            })
            .then((r) => r.data),

    // ─── Likes ───────────────────────────────────────────────────────────────

    /** Like a comment */
    like: (commentId: number) =>
        apiClient.post(`${BASE_URL}/${commentId}/like`),

    /** Unlike a comment */
    unlike: (commentId: number) =>
        apiClient.delete(`${BASE_URL}/${commentId}/like`),
}
