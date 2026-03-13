import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { answerService } from '../lib/api/services/answer.service'
import { questionService } from '../lib/api/services/question.service'
import {
  AnswerResponse,
  AskQuestionRequest,
  ProvideAnswerRequest,
  QuestionResponse,
  VoteType,
} from '../lib/api/types'

export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (mode: string, page: number, size: number, keyword?: string) =>
    [...questionKeys.lists(), mode, { page, size, keyword }] as const,
  detail: (questionId: number) => [...questionKeys.all, 'detail', questionId] as const,
  answers: (questionId: number) => [...questionKeys.all, questionId, 'answers'] as const,
}

export function useQuestions(page = 0, size = 10) {
  return useQuery({
    queryKey: questionKeys.list('all', page, size),
    queryFn: () => questionService.getAll(page, size),
  })
}

export function useResolvedQuestions(page = 0, size = 10) {
  return useQuery({
    queryKey: questionKeys.list('resolved', page, size),
    queryFn: () => questionService.getResolved(page, size),
  })
}

export function useUnresolvedQuestions(page = 0, size = 10) {
  return useQuery({
    queryKey: questionKeys.list('unresolved', page, size),
    queryFn: () => questionService.getUnresolved(page, size),
  })
}

export function useMostViewedQuestions(page = 0, size = 10) {
  return useQuery({
    queryKey: questionKeys.list('viewed', page, size),
    queryFn: () => questionService.getMostViewed(page, size),
  })
}

export function useQuestionSearch(keyword: string, page = 0, size = 10) {
  return useQuery({
    queryKey: questionKeys.list('search', page, size, keyword),
    queryFn: () => questionService.search(keyword, page, size),
    enabled: !!keyword.trim(),
  })
}

export function useQuestion(questionId: number | null) {
  return useQuery({
    queryKey: questionKeys.detail(questionId!),
    queryFn: () => questionService.getById(questionId!),
    enabled: !!questionId,
  })
}

export function useQuestionAnswers(questionId: number | null) {
  return useQuery({
    queryKey: questionKeys.answers(questionId!),
    queryFn: () => answerService.getByQuestion(questionId!),
    enabled: !!questionId,
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AskQuestionRequest) => questionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all })
      toast.success('Question posted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to post question')
    },
  })
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: number; data: AskQuestionRequest }) =>
      questionService.update(questionId, data),
    onSuccess: (question: QuestionResponse) => {
      queryClient.setQueryData(questionKeys.detail(question.id), question)
      queryClient.invalidateQueries({ queryKey: questionKeys.all })
      toast.success('Question updated')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update question')
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questionId: number) => questionService.delete(questionId),
    onSuccess: (_, questionId) => {
      queryClient.removeQueries({ queryKey: questionKeys.detail(questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.all })
      toast.success('Question deleted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete question')
    },
  })
}

export function useCreateAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: number; data: ProvideAnswerRequest }) =>
      answerService.create(questionId, data),
    onSuccess: (answer: AnswerResponse) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(answer.questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(answer.questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.all })
      toast.success('Answer posted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to post answer')
    },
  })
}

export function useUpdateAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, data }: { answerId: number; data: ProvideAnswerRequest }) =>
      answerService.update(answerId, data),
    onSuccess: (answer: AnswerResponse) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(answer.questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(answer.questionId) })
      toast.success('Answer updated')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update answer')
    },
  })
}

export function useDeleteAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, questionId }: { answerId: number; questionId: number }) =>
      answerService.delete(answerId),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.all })
      toast.success('Answer deleted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete answer')
    },
  })
}

export function useAcceptAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, questionId }: { answerId: number; questionId: number }) =>
      answerService.accept(answerId, questionId),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.all })
      toast.success('Answer accepted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to accept answer')
    },
  })
}

export function useVoteAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      answerId,
      questionId,
      voteType,
    }: {
      answerId: number
      questionId: number
      voteType: VoteType
    }) => answerService.vote(answerId, voteType),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) })
    },
  })
}

export function useRemoveAnswerVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, questionId }: { answerId: number; questionId: number }) =>
      answerService.removeVote(answerId),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) })
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) })
    },
  })
}
