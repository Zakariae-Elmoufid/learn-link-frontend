'use client'

import { useMemo, useState } from 'react'
import { Card, Button, Textarea, Input } from '../../../components/ui'
import {
  useDeleteModerationContent,
  useHideModerationContent,
  useModerationContent,
  useModerationLogs,
  useRestoreModerationContent,
  ModerationUiContentType,
} from '../../../hookes'
import { useAuthStore } from '../../../stores'
import {
  AlertCircle,
  Ban,
  Clock,
  Eye,
  EyeOff,
  FileWarning,
  Loader2,
  RefreshCcw,
  Shield,
  Trash2,
  X,
} from 'lucide-react'

type ActiveTab = 'content' | 'logs'
type PendingAction = 'hide' | 'restore' | 'delete'

interface ActionModalState {
  id: number
  action: PendingAction
}

const CONTENT_TYPE_LABELS: Record<ModerationUiContentType, string> = {
  posts: 'Posts',
  questions: 'Questions',
  answers: 'Answers',
  comments: 'Comments',
}

function trimText(text: string, max = 140) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

function getPageIndex(
  data?: {
    currentPage?: number
    number?: number
  },
) {
  if (!data) return 0
  return data.currentPage ?? data.number ?? 0
}

function getPageSize(
  data?: {
    pageSize?: number
    size?: number
  },
) {
  if (!data) return 20
  return data.pageSize ?? data.size ?? 20
}

export default function AdminModerationPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'

  const [activeTab, setActiveTab] = useState<ActiveTab>('content')

  const [contentType, setContentType] = useState<ModerationUiContentType>('posts')
  const [hiddenOnly, setHiddenOnly] = useState(false)
  const [contentPage, setContentPage] = useState(0)

  const [logsPage, setLogsPage] = useState(0)
  const [logsModeratorInput, setLogsModeratorInput] = useState('')
  const [logsModeratorFilter, setLogsModeratorFilter] = useState<number | undefined>(undefined)

  const [actionModal, setActionModal] = useState<ActionModalState | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [notifyUser, setNotifyUser] = useState(true)

  const contentQuery = useModerationContent(contentType, hiddenOnly, {
    page: contentPage,
    size: 20,
    sort: hiddenOnly ? 'hiddenAt' : 'createdAt',
  })

  const logsQuery = useModerationLogs({
    page: logsPage,
    size: 20,
    sort: 'createdAt',
    moderatorId: logsModeratorFilter,
  })

  const hideMutation = useHideModerationContent()
  const restoreMutation = useRestoreModerationContent()
  const deleteMutation = useDeleteModerationContent()

  const isActionPending = hideMutation.isPending || restoreMutation.isPending || deleteMutation.isPending

  const contentItems = contentQuery.data?.content ?? []
  const contentCurrentPage = getPageIndex(contentQuery.data)
  const contentPageSize = getPageSize(contentQuery.data)
  const contentTotalPages = contentQuery.data?.totalPages ?? 0

  const logsItems = logsQuery.data?.content ?? []
  const logsCurrentPage = getPageIndex(logsQuery.data)
  const logsPageSize = getPageSize(logsQuery.data)
  const logsTotalPages = logsQuery.data?.totalPages ?? 0

  const actionMeta = useMemo(() => {
    if (!actionModal) return null
    if (actionModal.action === 'hide') {
      return {
        title: `Hide ${CONTENT_TYPE_LABELS[contentType].slice(0, -1)}`,
        button: 'Hide Content',
        requiresReason: true,
        placeholder: 'Reason for hiding this content...',
      }
    }

    if (actionModal.action === 'restore') {
      return {
        title: `Restore ${CONTENT_TYPE_LABELS[contentType].slice(0, -1)}`,
        button: 'Restore Content',
        requiresReason: false,
        placeholder: 'Optional reason for restoration...',
      }
    }

    return {
      title: `Delete ${CONTENT_TYPE_LABELS[contentType].slice(0, -1)} Permanently`,
      button: 'Delete Permanently',
      requiresReason: true,
      placeholder: 'Reason for permanent deletion...',
    }
  }, [actionModal, contentType])

  const openActionModal = (id: number, action: PendingAction) => {
    setActionModal({ id, action })
    setActionReason('')
    setNotifyUser(true)
  }

  const closeActionModal = () => {
    setActionModal(null)
    setActionReason('')
    setNotifyUser(true)
  }

  const submitAction = async () => {
    if (!actionModal) return

    if ((actionModal.action === 'hide' || actionModal.action === 'delete') && !actionReason.trim()) {
      return
    }

    const reason = actionReason.trim()

    if (actionModal.action === 'hide') {
      await hideMutation.mutateAsync({
        type: contentType,
        id: actionModal.id,
        reason,
        notifyUser: contentType === 'comments' ? notifyUser : undefined,
      })
    } else if (actionModal.action === 'restore') {
      await restoreMutation.mutateAsync({ type: contentType, id: actionModal.id, reason: reason || undefined })
    } else {
      await deleteMutation.mutateAsync({
        type: contentType,
        id: actionModal.id,
        reason,
        notifyUser: contentType === 'comments' ? notifyUser : undefined,
      })
    }

    closeActionModal()
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileWarning className="h-8 w-8 text-amber-500" />
            Content Moderation
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Review and moderate posts, questions, answers, and moderation logs.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'content'
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'logs'
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Moderation Logs
          </button>
        </div>
      </div>

      {activeTab === 'content' && (
        <>
          <Card className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <select
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={contentType}
                  onChange={(e) => {
                    setContentType(e.target.value as ModerationUiContentType)
                    setContentPage(0)
                  }}
                >
                  <option value="posts">Posts</option>
                  <option value="questions">Questions</option>
                  <option value="answers">Answers</option>
                  <option value="comments">Comments</option>
                </select>

                <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hiddenOnly}
                    onChange={(e) => {
                      setHiddenOnly(e.target.checked)
                      setContentPage(0)
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  Hidden only
                </label>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                {contentQuery.data ? `${contentQuery.data.totalElements} total results` : 'Loading...'}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/80 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Content</th>
                    <th className="px-6 py-4 font-semibold">Author</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                        <p className="mt-2 text-slate-500">Loading moderation content...</p>
                      </td>
                    </tr>
                  ) : contentQuery.isError ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                        <p className="mt-2 text-red-600">Failed to load content for moderation.</p>
                      </td>
                    </tr>
                  ) : contentItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No {CONTENT_TYPE_LABELS[contentType].toLowerCase()} found for this filter.
                      </td>
                    </tr>
                  ) : (
                    contentItems.map((item) => (
                      <tr
                        key={item.id}
                        className="bg-white border-b dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 max-w-xl">
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {item.title || `${CONTENT_TYPE_LABELS[contentType].slice(0, -1)} #${item.id}`}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{trimText(item.content)}</p>
                          {contentType === 'comments' && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              Source: {item.postId ? `Post #${item.postId}` : item.answerId ? `Answer #${item.answerId}` : 'Unknown'}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.username}</td>
                        <td className="px-6 py-4">
                          {item.hidden ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              <EyeOff className="h-3.5 w-3.5" /> Hidden
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <Eye className="h-3.5 w-3.5" /> Visible
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{formatDate(item.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {!item.hidden && (
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                                onClick={() => openActionModal(item.id, 'hide')}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}

                            {item.hidden && isAdmin && (
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-green-700 border-green-200 hover:bg-green-50"
                                onClick={() => openActionModal(item.id, 'restore')}
                              >
                                <RefreshCcw className="h-4 w-4" />
                              </Button>
                            )}

                            {isAdmin && (
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => openActionModal(item.id, 'delete')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {contentTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page <span className="font-semibold text-slate-900 dark:text-white">{contentCurrentPage + 1}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">{contentTotalPages}</span>
                  {' '}({contentPageSize} per page)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setContentPage((p) => Math.max(0, p - 1))}
                    disabled={contentCurrentPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setContentPage((p) => p + 1)}
                    disabled={contentCurrentPage + 1 >= contentTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {activeTab === 'logs' && (
        <>
          <Card className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <form
              className="flex flex-col sm:flex-row sm:items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                const parsed = logsModeratorInput.trim() ? Number(logsModeratorInput) : undefined
                setLogsModeratorFilter(Number.isFinite(parsed) ? parsed : undefined)
                setLogsPage(0)
              }}
            >
              <div className="w-full sm:w-64">
                <Input
                  label="Moderator ID"
                  value={logsModeratorInput}
                  placeholder="e.g. 100"
                  onChange={(e) => setLogsModeratorInput(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary">Apply Filter</Button>
                {logsModeratorFilter !== undefined && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLogsModeratorInput('')
                      setLogsModeratorFilter(undefined)
                      setLogsPage(0)
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/80 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Target</th>
                    <th className="px-6 py-4 font-semibold">Moderator</th>
                    <th className="px-6 py-4 font-semibold">Reason</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logsQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                        <p className="mt-2 text-slate-500">Loading moderation logs...</p>
                      </td>
                    </tr>
                  ) : logsQuery.isError ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                        <p className="mt-2 text-red-600">Failed to load moderation logs.</p>
                      </td>
                    </tr>
                  ) : logsItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No logs found for this filter.
                      </td>
                    </tr>
                  ) : (
                    logsItems.map((log) => (
                      <tr
                        key={log.id}
                        className="bg-white border-b dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            <Shield className="h-3.5 w-3.5" /> {log.actionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                           {log.targetType}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {log.moderatorUsername}
                        </td>
                        <td className="px-6 py-4 max-w-sm text-xs text-slate-600 dark:text-slate-400">
                          {log.reason || 'No reason provided'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {formatDate(log.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {logsTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page <span className="font-semibold text-slate-900 dark:text-white">{logsCurrentPage + 1}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">{logsTotalPages}</span>
                  {' '}({logsPageSize} per page)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLogsPage((p) => Math.max(0, p - 1))}
                    disabled={logsCurrentPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLogsPage((p) => p + 1)}
                    disabled={logsCurrentPage + 1 >= logsTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {actionModal && actionMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 shadow-2xl relative border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeActionModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{actionMeta.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Target ID: <span className="font-semibold">#{actionModal.id}</span>
            </p>

            <div className="mt-4">
              <Textarea
                label="Reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionMeta.placeholder}
                rows={4}
              />
              {actionMeta.requiresReason && !actionReason.trim() && (
                <p className="text-xs text-amber-600 mt-1">Reason is required for this action.</p>
              )}

              {contentType === 'comments' && (actionModal.action === 'hide' || actionModal.action === 'delete') && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyUser}
                    onChange={(e) => setNotifyUser(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  Notify user about this moderation action
                </label>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={closeActionModal}>
                Cancel
              </Button>
              <Button
                type="button"
                variant={actionModal.action === 'delete' ? 'destructive' : 'primary'}
                onClick={submitAction}
                disabled={isActionPending || (actionMeta.requiresReason && !actionReason.trim())}
                className="gap-2"
              >
                {isActionPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {actionMeta.button}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
