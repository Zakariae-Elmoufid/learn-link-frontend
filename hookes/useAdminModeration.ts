import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { adminModerationService } from '../lib/api/services/admin-moderation.service'

export type ModerationUiContentType = 'posts' | 'questions' | 'answers' | 'comments'

interface ModerationListParams {
  page?: number
  size?: number
  sort?: string
}

interface ModerationLogsParams {
  page?: number
  size?: number
  sort?: string
  moderatorId?: number
}

const QUERY_KEYS = {
  root: ['admin-moderation'] as const,
  content: (type: ModerationUiContentType, hiddenOnly: boolean, params: ModerationListParams) =>
    [...QUERY_KEYS.root, 'content', type, hiddenOnly, params] as const,
  logs: (params: ModerationLogsParams) => [...QUERY_KEYS.root, 'logs', params] as const,
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const apiMessage = error.response?.data?.message
    if (apiMessage) return apiMessage
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function useModerationContent(
  type: ModerationUiContentType,
  hiddenOnly: boolean,
  params: ModerationListParams,
) {
  return useQuery({
    queryKey: QUERY_KEYS.content(type, hiddenOnly, params),
    queryFn: () => {
      if (type === 'posts') {
        return hiddenOnly
          ? adminModerationService.getHiddenPosts(params)
          : adminModerationService.getPosts(params)
      }

      if (type === 'questions') {
        return hiddenOnly
          ? adminModerationService.getHiddenQuestions(params)
          : adminModerationService.getQuestions(params)
      }

      if (type === 'comments') {
        return hiddenOnly
          ? adminModerationService.getHiddenComments(params)
          : adminModerationService.getComments(params)
      }

      return hiddenOnly
        ? adminModerationService.getHiddenAnswers(params)
        : adminModerationService.getAnswers(params)
    },
  })
}

export function useModerationLogs(params: ModerationLogsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.logs(params),
    queryFn: () => {
      if (params.moderatorId) {
        return adminModerationService.getLogsByModerator(params.moderatorId, {
          page: params.page,
          size: params.size,
        })
      }

      return adminModerationService.getLogs({
        page: params.page,
        size: params.size,
        sort: params.sort,
      })
    },
  })
}

export function useHideModerationContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      type,
      id,
      reason,
      notifyUser,
    }: {
      type: ModerationUiContentType
      id: number
      reason: string
      notifyUser?: boolean
    }) => {
      if (type === 'posts') return adminModerationService.hidePost(id, { reason })
      if (type === 'questions') return adminModerationService.hideQuestion(id, { reason })
      if (type === 'comments') return adminModerationService.hideComment(id, { reason, notifyUser })
      return adminModerationService.hideAnswer(id, { reason })
    },
    onSuccess: () => {
      toast.success('Content hidden successfully')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.root })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to hide content')),
  })
}

export function useRestoreModerationContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      type,
      id,
      reason,
    }: {
      type: ModerationUiContentType
      id: number
      reason?: string
    }) => {
      if (type === 'posts') return adminModerationService.restorePost(id, reason)
      if (type === 'questions') return adminModerationService.restoreQuestion(id, reason)
      if (type === 'comments') return adminModerationService.restoreComment(id, reason)
      return adminModerationService.restoreAnswer(id, reason)
    },
    onSuccess: () => {
      toast.success('Content restored successfully')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.root })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to restore content')),
  })
}

export function useDeleteModerationContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      type,
      id,
      reason,
      notifyUser,
    }: {
      type: ModerationUiContentType
      id: number
      reason: string
      notifyUser?: boolean
    }) => {
      if (type === 'posts') return adminModerationService.deletePost(id, { reason })
      if (type === 'questions') return adminModerationService.deleteQuestion(id, { reason })
      if (type === 'comments') return adminModerationService.deleteComment(id, { reason, notifyUser })
      return adminModerationService.deleteAnswer(id, { reason })
    },
    onSuccess: () => {
      toast.success('Content permanently deleted')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.root })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to permanently delete content')),
  })
}
