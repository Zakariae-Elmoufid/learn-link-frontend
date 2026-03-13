'use client'

import { Flame, Heart, MessageCircle, TrendingUp } from 'lucide-react'
import type { PostCategory, PostResponse } from '../../lib/api/types'
import { Badge, Card } from '../ui'
import { formatCategory, formatRelativeTime } from './utils'

interface CommunitySidebarProps {
    spotlightPosts: PostResponse[]
    popularCategories: [PostCategory, number][]
}

export function CommunitySidebar({ spotlightPosts, popularCategories }: CommunitySidebarProps) {
    return (
        <div className="space-y-6">
            <Card padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Trending Posts</h2>
                </div>
                <div className="mt-4 space-y-4">
                    {spotlightPosts.length === 0 ? (
                        <p className="text-sm text-slate-500">No trending posts yet.</p>
                    ) : (
                        spotlightPosts.map((post) => (
                            <div key={post.id} className="rounded-2xl border border-slate-100 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <Badge variant="accent">{post.type}</Badge>
                                    <span className="text-xs text-slate-400">{formatRelativeTime(post.createdAt)}</span>
                                </div>
                                <h3 className="mt-3 text-sm font-semibold text-slate-900">{post.title}</h3>
                                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.content}</p>
                                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                        <Heart className="h-3.5 w-3.5" />
                                        {post.likesCount}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        {post.commentsCount}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Card padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Popular Categories</h2>
                </div>
                <div className="mt-4 space-y-3">
                    {popularCategories.length === 0 ? (
                        <p className="text-sm text-slate-500">Not enough post data yet.</p>
                    ) : (
                        popularCategories.map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{formatCategory(category)}</p>
                                    <p className="text-xs text-slate-500">Seen in the popular feed</p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
                                    {count}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}
