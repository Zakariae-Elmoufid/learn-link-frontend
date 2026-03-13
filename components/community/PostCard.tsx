'use client'

import { memo } from 'react'
import { Eye, Heart, MessageCircle } from 'lucide-react'
import { useTogglePostLike } from '../../hookes'
import type { PostResponse } from '../../lib/api/types'
import { Avatar, Badge, Card, Skeleton } from '../ui'
import { formatCategory, formatRelativeTime } from './utils'

export const PostCard = memo(function PostCard({
    post,
    onOpenPost,
}: {
    post: PostResponse
    onOpenPost: (postId: number) => void
}) {
    const { toggle, isLoading } = useTogglePostLike()

    return (
        <Card padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Avatar name={`User ${post.userId}`} size="md" />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">Student #{post.userId}</p>
                            <span className="text-xs text-slate-400">{formatRelativeTime(post.createdAt)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="primary">{post.type}</Badge>
                            <Badge variant="gray">{formatCategory(post.category)}</Badge>
                        </div>
                    </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    {post.viewCount} views
                </span>
            </div>

            <div className="mt-4 space-y-2">
                <button
                    type="button"
                    onClick={() => onOpenPost(post.id)}
                    className="inline-block text-left"
                >
                    <h3 className="text-lg font-semibold text-slate-950 hover:text-primary-700 transition-colors">
                        {post.title}
                    </h3>
                </button>
                <p className="text-sm leading-6 text-slate-600">{post.content}</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => toggle(post.id, post.likedByCurrentUser)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-rose-50 disabled:opacity-50 ${
                            post.likedByCurrentUser
                                ? 'text-rose-500'
                                : 'text-slate-500 hover:text-rose-500'
                        }`}
                    >
                        <Heart className={`h-4 w-4 transition-all ${post.likedByCurrentUser ? 'fill-current scale-110' : ''}`} />
                        {post.likesCount}
                    </button>

                    <button
                        type="button"
                        onClick={() => onOpenPost(post.id)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    >
                        <MessageCircle className="h-4 w-4" />
                        {post.commentsCount}
                    </button>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Eye className="h-3.5 w-3.5" />
                    {post.viewCount}
                </span>
            </div>
        </Card>
    )
})

export function PostCardSkeleton() {
    return (
        <Card padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                </div>
            </div>
            <div className="mt-4 space-y-3">
                <Skeleton className="h-6 w-2/3 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-5/6 rounded-xl" />
            </div>
            <div className="mt-5 flex gap-3">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
        </Card>
    )
}
