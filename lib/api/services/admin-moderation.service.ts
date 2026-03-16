import { apiClient } from '../api-client'
import {
  AdminModerationContentItem,
  ModerationActionResponse,
  ModerationLogItem,
  ModerationPageResponse,
  ModerationReasonRequest,
} from '../types'

interface ModerationListParams {
  page?: number
  size?: number
  sort?: string
}

const BASE_URL = '/admin/moderation'

export const adminModerationService = {
  getPosts: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/posts`, { params })
      .then((res) => res.data),

  getHiddenPosts: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/posts/hidden`, { params })
      .then((res) => res.data),

  hidePost: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/posts/${id}/hide`, data)
      .then((res) => res.data),

  restorePost: (id: number, reason?: string) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/posts/${id}/restore`, undefined, {
        params: { reason: reason || undefined },
      })
      .then((res) => res.data),

  deletePost: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .delete<ModerationActionResponse>(`${BASE_URL}/posts/${id}`, { data })
      .then((res) => res.data),

  getQuestions: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/questions`, { params })
      .then((res) => res.data),

  getHiddenQuestions: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/questions/hidden`, { params })
      .then((res) => res.data),

  hideQuestion: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/questions/${id}/hide`, data)
      .then((res) => res.data),

  restoreQuestion: (id: number, reason?: string) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/questions/${id}/restore`, undefined, {
        params: { reason: reason || undefined },
      })
      .then((res) => res.data),

  deleteQuestion: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .delete<ModerationActionResponse>(`${BASE_URL}/questions/${id}`, { data })
      .then((res) => res.data),

  getAnswers: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/answers`, { params })
      .then((res) => res.data),

  getHiddenAnswers: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/answers/hidden`, { params })
      .then((res) => res.data),

  hideAnswer: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/answers/${id}/hide`, data)
      .then((res) => res.data),

  restoreAnswer: (id: number, reason?: string) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/answers/${id}/restore`, undefined, {
        params: { reason: reason || undefined },
      })
      .then((res) => res.data),

  deleteAnswer: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .delete<ModerationActionResponse>(`${BASE_URL}/answers/${id}`, { data })
      .then((res) => res.data),

  getComments: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/comments`, { params })
      .then((res) => res.data),

  getHiddenComments: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<AdminModerationContentItem>>(`${BASE_URL}/comments/hidden`, { params })
      .then((res) => res.data),

  hideComment: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/comments/${id}/hide`, data)
      .then((res) => res.data),

  restoreComment: (id: number, reason?: string) =>
    apiClient
      .patch<ModerationActionResponse>(`${BASE_URL}/comments/${id}/restore`, undefined, {
        params: { reason: reason || undefined },
      })
      .then((res) => res.data),

  deleteComment: (id: number, data: ModerationReasonRequest) =>
    apiClient
      .delete<ModerationActionResponse>(`${BASE_URL}/comments/${id}`, { data })
      .then((res) => res.data),

  getLogs: (params: ModerationListParams = {}) =>
    apiClient
      .get<ModerationPageResponse<ModerationLogItem>>(`${BASE_URL}/logs`, { params })
      .then((res) => res.data),

  getLogsByModerator: (moderatorId: number, params: Omit<ModerationListParams, 'sort'> = {}) =>
    apiClient
      .get<ModerationPageResponse<ModerationLogItem>>(`${BASE_URL}/logs/moderator/${moderatorId}`, {
        params,
      })
      .then((res) => res.data),
}
