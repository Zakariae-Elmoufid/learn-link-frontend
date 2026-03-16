'use client'

import Link from 'next/link'
import { AlertCircle, FileWarning, MessageSquare, HelpCircle, FileText, MessageCircleMore, ShieldCheck, ShieldOff } from 'lucide-react'
import { Card, Button } from '../../components/ui'
import { useModerationContent } from '../../hookes'
import { useModerationPermissions } from "@/hookes/useModerator";

export default function ModeratorDashboardPage() {
  const postsQuery = useModerationContent('posts', false, { page: 0, size: 1, sort: 'createdAt' })
  const questionsQuery = useModerationContent('questions', false, { page: 0, size: 1, sort: 'createdAt' })
  const answersQuery = useModerationContent('answers', false, { page: 0, size: 1, sort: 'createdAt' })
  const commentsQuery = useModerationContent('comments', false, { page: 0, size: 1, sort: 'createdAt' })
  const permissionsQuery =   useModerationPermissions();
  const isLoading = postsQuery.isLoading || questionsQuery.isLoading || answersQuery.isLoading || commentsQuery.isLoading
  const hasError = postsQuery.isError || questionsQuery.isError || answersQuery.isError || commentsQuery.isError

  const cards = [
    {
      label: 'Posts',
      value: postsQuery.data?.totalElements ?? 0,
      icon: <FileText className="h-5 w-5" />,
      tone: 'bg-blue-500',
    },
    {
      label: 'Questions',
      value: questionsQuery.data?.totalElements ?? 0,
      icon: <HelpCircle className="h-5 w-5" />,
      tone: 'bg-amber-500',
    },
    {
      label: 'Answers',
      value: answersQuery.data?.totalElements ?? 0,
      icon: <MessageSquare className="h-5 w-5" />,
      tone: 'bg-emerald-500',
    },
    {
      label: 'Comments',
      value: commentsQuery.data?.totalElements ?? 0,
      icon: <MessageCircleMore className="h-5 w-5" />,
      tone: 'bg-violet-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Moderator Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md">
          Moderation data could not be loaded. Check your permissions and API availability, then try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileWarning className="h-8 w-8 text-amber-500" />
            Moderator Dashboard
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Review community content and take moderation actions where needed.
          </p>
        </div>

        <Link href="/moderator/moderation">
          <Button className="gap-2">
            <FileWarning className="h-4 w-4" />
            Open Moderation Queue
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.label} className="p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg border-none ring-1 ring-slate-100 dark:ring-slate-800">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${card.tone}`}></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{card.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available for review</p>
              </div>
              <div className={`p-3 rounded-xl text-white shadow-sm ${card.tone}`}>
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          Your Permissions
        </h2>
        {permissionsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            Loading permissions…
          </div>
        ) : permissionsQuery.isError ? (
          <p className="text-sm text-red-500">Could not load permissions. Please try again.</p>
        ) : permissionsQuery.data?.currentPermissions?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {permissionsQuery.data.currentPermissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{perm}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ShieldOff className="h-4 w-4" />
            No permissions assigned yet. Contact an administrator.
          </div>
        )}
      </Card>
    </div>
  )
}