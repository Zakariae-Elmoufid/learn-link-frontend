import { apiClient } from '../api-client'
import {
    CreatePostRequest,
    UpdatePostRequest,
    PostResponse,
    PostCategory,
    PostType,
    PageResponse,
    PostSearchParams,
} from '../types'

const BASE_URL = '/community/posts'

export const postService = {
    // ─── CRUD ────────────────────────────────────────────────────────────────

    /** Create a new post */
    create: (data: CreatePostRequest) =>
        apiClient
            .post<PostResponse>(BASE_URL, data)
            .then((r) => r.data),

    /** Get a post by ID */
    getById: (postId: number) =>
        apiClient
            .get<PostResponse>(`${BASE_URL}/${postId}`)
            .then((r) => r.data),

    /** Update a post */
    update: (postId: number, data: UpdatePostRequest) =>
        apiClient
            .put<PostResponse>(`${BASE_URL}/${postId}`, data)
            .then((r) => r.data),

    /** Delete a post */
    delete: (postId: number) =>
        apiClient.delete(`${BASE_URL}/${postId}`),

    // ─── Listing & Discovery ─────────────────────────────────────────────────

    /** Get all posts with pagination */
    getAll: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<PostResponse>>(BASE_URL, { params: { page, size } })
            .then((r) => r.data),

    /** Get posts by category */
    getByCategory: (category: PostCategory, page = 0, size = 20) =>
        apiClient
            .get<PageResponse<PostResponse>>(`${BASE_URL}/category/${category}`, {
                params: { page, size },
            })
            .then((r) => r.data),

    /** Get popular posts */
    getPopular: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<PostResponse>>(`${BASE_URL}/popular`, {
                params: { page, size },
            })
            .then((r) => r.data),

    /** Get trending posts */
    getTrending: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<PostResponse>>(`${BASE_URL}/trending`, {
                params: { page, size },
            })
            .then((r) => r.data),

    /** Get posts by user ID */
    getByUser: (userId: number, page = 0, size = 20) =>
        apiClient
            .get<PageResponse<PostResponse>>(`${BASE_URL}/user/${userId}`, {
                params: { page, size },
            })
            .then((r) => r.data),

    /** Search posts with filters */
    search: (params: PostSearchParams) =>
        apiClient
            .get<PageResponse<PostResponse>>(`${BASE_URL}/search`, {
                params: {
                    keyword: params.keyword,
                    category: params.category,
                    type: params.type,
                    page: params.page ?? 0,
                    size: params.size ?? 20,
                },
            })
            .then((r) => r.data),

    // ─── Likes ───────────────────────────────────────────────────────────────

    /** Like a post */
    like: (postId: number) =>
        apiClient.post(`${BASE_URL}/${postId}/like`),

    /** Unlike a post */
    unlike: (postId: number) =>
        apiClient.delete(`${BASE_URL}/${postId}/like`),
}
