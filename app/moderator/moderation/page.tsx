'use client'

import { useState } from 'react'
import { AlertCircle, Ban, Eye, EyeOff, FileWarning, Loader2, X } from 'lucide-react'
import { Button, Card, Textarea } from '../../../components/ui'
import { ModerationUiContentType, useHideModerationContent, useModerationContent } from '../../../hookes'

const CONTENT_TYPE_LABELS: Record<ModerationUiContentType, string> = {
  posts: 'Posts',
  questions: 'Questions',
  answers: 'Answers',
  comments: 'Comments',
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

function trimText(text: string, max = 140) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

export default function ModeratorModerationPage() {
  const [contentType, setContentType] = useState<ModerationUiContentType>('posts')
  const [page, setPage] = useState(0)
  const [targetId, setTargetId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [notifyUser, setNotifyUser] = useState(true)

  const contentQuery = useModerationContent(contentType, false, {
    page,
    size: 20,
    sort: 'createdAt',
  })

  const hideMutation = useHideModerationContent()

  const items = contentQuery.data?.content ?? []
  const currentPage = getPageIndex(contentQuery.data)
  const totalPages = contentQuery.data?.totalPages ?? 0
  const pageSize = getPageSize(contentQuery.data)

  const closeModal = () => {
    setTargetId(null)
    setReason('')
    setNotifyUser(true)
  }

  const submitHide = async () => {
    if (!targetId || !reason.trim()) return

    await hideMutation.mutateAsync({
      type: contentType,
      id: targetId,
      reason: reason.trim(),
      notifyUser: contentType === 'comments' ? notifyUser : undefined,
    })

    closeModal()
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileWarning className="h-8 w-8 text-amber-500" />
          Moderation Queue
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Review public content and hide items that violate community guidelines.
        </p>
      </div>

      <Card className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <select
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value as ModerationUiContentType)
                setPage(0)
              }}
            >
              <option value="posts">Posts</option>
              <option value="questions">Questions</option>
              <option value="answers">Answers</option>
              <option value="comments">Comments</option>
            </select>
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
                <th className="px-6 py-4 font-semibold text-right">Action</th>
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
                    <p className="mt-2 text-red-600">Failed to load moderation content.</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No {CONTENT_TYPE_LABELS[contentType].toLowerCase()} available for review.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
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
                    <td className="px-6 py-4 text-right">
                      {!item.hidden ? (
                        <Button
                          variant="outline"
                          className="h-8 px-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                          onClick={() => {
                            setTargetId(item.id)
                            setReason('')
                            setNotifyUser(true)
                          }}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Admin review required</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage + 1}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
              {' '}({pageSize} per page)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((value) => value + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {targetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 shadow-2xl relative border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Hide {CONTENT_TYPE_LABELS[contentType].slice(0, -1)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Target ID: <span className="font-semibold">#{targetId}</span>
            </p>

            <div className="mt-4">
              <Textarea
                label="Reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason for hiding this content..."
                rows={4}
              />
              {!reason.trim() && <p className="text-xs text-amber-600 mt-1">Reason is required.</p>}

              {contentType === 'comments' && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyUser}
                    onChange={(event) => setNotifyUser(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  Notify user about this moderation action
                </label>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitHide}
                disabled={hideMutation.isPending || !reason.trim()}
                className="gap-2"
              >
                {hideMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Hide Content
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}