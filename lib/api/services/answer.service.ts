import { apiClient } from '../api-client'
import { AnswerResponse, PageResponse, ProvideAnswerRequest, VoteType } from '../types'

const BASE_URL = '/community/answers'

export const answerService = {
    create: (questionId: number, data: ProvideAnswerRequest) =>
        apiClient
            .post<AnswerResponse>(BASE_URL, data, { params: { questionId } })
            .then((r) => r.data),

    getById: (answerId: number) =>
        apiClient
            .get<AnswerResponse>(`${BASE_URL}/${answerId}`)
            .then((r) => r.data),

    getByQuestion: (questionId: number) =>
        apiClient
            .get<AnswerResponse[]>(`${BASE_URL}/question/${questionId}`)
            .then((r) => r.data),

    getByUser: (userId: number, page = 0, size = 20) =>
        apiClient
            .get<PageResponse<AnswerResponse>>(`${BASE_URL}/user/${userId}`, { params: { page, size } })
            .then((r) => r.data),

    getTop: (page = 0, size = 20) =>
        apiClient
            .get<PageResponse<AnswerResponse>>(`${BASE_URL}/top`, { params: { page, size } })
            .then((r) => r.data),

    update: (answerId: number, data: ProvideAnswerRequest) =>
        apiClient
            .put<AnswerResponse>(`${BASE_URL}/${answerId}`, data)
            .then((r) => r.data),

    delete: (answerId: number) =>
        apiClient.delete(`${BASE_URL}/${answerId}`),

    accept: (answerId: number, questionId: number) =>
        apiClient.post(`${BASE_URL}/${answerId}/accept`, null, { params: { questionId } }),

    vote: (answerId: number, voteType: VoteType) =>
        apiClient.post(`${BASE_URL}/${answerId}/vote`, null, { params: { voteType } }),

    removeVote: (answerId: number) =>
        apiClient.delete(`${BASE_URL}/${answerId}/vote`),
}
