import { apiClient } from '../api-client'
import { AskQuestionRequest, PageResponse, QuestionResponse } from '../types'

const BASE_URL = '/community/questions'

export const questionService = {
    create: (data: AskQuestionRequest) =>
        apiClient
            .post<QuestionResponse>(BASE_URL, data)
            .then((r) => r.data),

    getById: (questionId: number) =>
        apiClient
            .get<QuestionResponse>(`${BASE_URL}/${questionId}`)
            .then((r) => r.data),

    getAll: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<QuestionResponse>>(BASE_URL, { params: { page, size } })
            .then((r) => r.data),

    getUnresolved: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<QuestionResponse>>(`${BASE_URL}/unresolved`, { params: { page, size } })
            .then((r) => r.data),

    getResolved: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<QuestionResponse>>(`${BASE_URL}/resolved`, { params: { page, size } })
            .then((r) => r.data),

    getByUser: (userId: number, page = 0, size = 20) =>
        apiClient
            .get<PageResponse<QuestionResponse>>(`${BASE_URL}/user/${userId}`, { params: { page, size } })
            .then((r) => r.data),

    search: (keyword: string, page = 0, size = 20) =>
        apiClient
            .get<PageResponse<QuestionResponse>>(`${BASE_URL}/search`, { params: { keyword, page, size } })
            .then((r) => r.data),

    getMostViewed: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<QuestionResponse>>(`${BASE_URL}/viewed`, { params: { page, size } })
            .then((r) => r.data),

    update: (questionId: number, data: AskQuestionRequest) =>
        apiClient
            .put<QuestionResponse>(`${BASE_URL}/${questionId}`, data)
            .then((r) => r.data),

    delete: (questionId: number) =>
        apiClient.delete(`${BASE_URL}/${questionId}`),
}
