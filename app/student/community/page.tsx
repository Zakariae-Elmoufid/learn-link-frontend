'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { BookOpen, Search, Sparkles } from 'lucide-react'
import {
    useAllPosts,
    useMyProfile,
    usePopularPosts,
    usePosts,
    useSearchPosts,
    useTrendingPosts,
} from '../../../hookes'
import type { PostCategory, PostResponse, PostType } from '../../../lib/api/types'
import { Button, Card, EmptyState, Input } from '../../../components/ui'
import {
    CommunitySidebar,
    PostCard,
    PostCardSkeleton,
    PostComposer,
    PostDetailsModal,
    QuestionsSection,
} from '../../../components/community'

type CommunityTab = 'ALL' | PostType
type FeedMode = 'recent' | 'popular' | 'trending'
type CommunityContentMode = 'posts' | 'questions'

const tabOptions: Array<{ value: CommunityTab; label: string }> = [
    { value: 'ALL', label: 'All Posts' },
    { value: 'DISCUSSION', label: 'Discussions' },
    { value: 'TUTORIAL', label: 'Tutorials' },
    { value: 'SUMMARY', label: 'Summaries' },
]

const feedOptions: Array<{ value: FeedMode; label: string }> = [
    { value: 'recent', label: 'Recent' },
    { value: 'popular', label: 'Popular' },
    { value: 'trending', label: 'Trending' },
]

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<CommunityTab>('ALL')
    const [feedMode, setFeedMode] = useState<FeedMode>('recent')
    const [page, setPage] = useState(0)
    const [searchInput, setSearchInput] = useState('')
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
    const [contentMode, setContentMode] = useState<CommunityContentMode>('posts')
    const deferredSearch = useDeferredValue(searchInput.trim())

    const { data: profile } = useMyProfile()
    const allPostsQuery = useAllPosts(20)
    const postsQuery = usePosts(page, 10)
    const popularFeedQuery = usePopularPosts(page, 10)
    const trendingFeedQuery = useTrendingPosts(page, 10)
    const popularQuery = usePopularPosts(0, 5)
    const trendingQuery = useTrendingPosts(0, 5)
    const searchQuery = useSearchPosts({
        keyword: deferredSearch || undefined,
        type: activeTab === 'ALL' ? undefined : activeTab,
        page,
        size: 10,
    })

    const activeQuery = deferredSearch
        ? searchQuery
        : feedMode === 'popular'
          ? popularFeedQuery
          : feedMode === 'trending'
            ? trendingFeedQuery
            : postsQuery

    const shouldUseAllPosts = !deferredSearch && feedMode === 'recent'

    useEffect(() => {
        if (!shouldUseAllPosts) return
        if (!allPostsQuery.hasNextPage || allPostsQuery.isFetchingNextPage) return
        allPostsQuery.fetchNextPage()
    }, [
        shouldUseAllPosts,
        allPostsQuery.hasNextPage,
        allPostsQuery.isFetchingNextPage,
        allPostsQuery.fetchNextPage,
    ])

    const filteredPosts = useMemo(() => {
        const sourcePosts = shouldUseAllPosts
            ? allPostsQuery.posts
            : activeQuery.data?.content ?? []
        if (activeTab === 'ALL') {
            return sourcePosts
        }
        return sourcePosts.filter((post) => post.type === activeTab)
    }, [activeQuery.data?.content, activeTab, shouldUseAllPosts, allPostsQuery.posts])

    const spotlightPosts = useMemo(
        () => trendingQuery.data?.content.slice(0, 3) ?? [],
        [trendingQuery.data?.content],
    )

    const popularCategories = useMemo(() => {
        const counts = new Map<PostCategory, number>()
        for (const post of popularQuery.data?.content ?? []) {
            counts.set(post.category, (counts.get(post.category) ?? 0) + 1)
        }
        return Array.from(counts.entries())
            .sort((left, right) => right[1] - left[1])
            .slice(0, 4)
    }, [popularQuery.data?.content])

    const isLoading = shouldUseAllPosts
        ? allPostsQuery.isLoading || allPostsQuery.isFetching
        : activeQuery.isLoading || activeQuery.isFetching

    const totalPages = shouldUseAllPosts
        ? allPostsQuery.totalPages
        : activeQuery.data?.totalPages ?? 0

    const totalElements = shouldUseAllPosts
        ? allPostsQuery.totalElements
        : activeQuery.data?.totalElements ?? 0

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_45%,_#eef5ff_100%)] p-6 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Community Hub
                        </div>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                            Learn in public with students working on the same problems.
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                            Publish tutorials, distilled summaries, and discussion prompts. The post feed below is wired to the community posts API.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Card padding="md" className="min-w-[160px] border border-white/70 bg-white/80 backdrop-blur">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recent posts</p>
                            <p className="mt-2 text-2xl font-bold text-slate-950">
                                {totalElements || postsQuery.data?.totalElements || 0}
                            </p>
                        </Card>
                        <Card padding="md" className="min-w-[160px] border border-white/70 bg-white/80 backdrop-blur">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Trending now</p>
                            <p className="mt-2 text-2xl font-bold text-slate-950">
                                {trendingQuery.data?.content.length ?? 0}
                            </p>
                        </Card>
                        <Card padding="md" className="min-w-[160px] border border-white/70 bg-white/80 backdrop-blur">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your profile</p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">
                                {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Student'}
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setContentMode('posts')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        contentMode === 'posts'
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Posts
                </button>
                <button
                    type="button"
                    onClick={() => setContentMode('questions')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        contentMode === 'questions'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Questions
                </button>
            </div>

            {contentMode === 'posts' ? (
                <>
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-6">
                            <PostComposer />

                            <Card padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        {tabOptions.map((tab) => (
                                            <button
                                                key={tab.value}
                                                type="button"
                                                onClick={() => {
                                                    setActiveTab(tab.value)
                                                    setPage(0)
                                                }}
                                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                                    activeTab === tab.value
                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <div className="w-full sm:w-72">
                                            <Input
                                                value={searchInput}
                                                onChange={(event) => {
                                                    setSearchInput(event.target.value)
                                                    setPage(0)
                                                }}
                                                placeholder="Search posts by keyword"
                                                icon={<Search className="h-4 w-4" />}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Sort:</span>
                                            <select
                                                value={feedMode}
                                                onChange={(event) => {
                                                    setFeedMode(event.target.value as FeedMode)
                                                    setPage(0)
                                                }}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                            >
                                                {feedOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-4">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={index} />)
                                ) : filteredPosts.length === 0 ? (
                                    <Card padding="lg" className="border border-dashed border-slate-300 bg-white">
                                        <EmptyState
                                            icon={<BookOpen className="h-10 w-10" />}
                                            title="No posts match this view"
                                            description="Try a different search, switch the feed mode, or publish the first post in this category."
                                        />
                                    </Card>
                                ) : (
                                    filteredPosts.map((post: PostResponse) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onOpenPost={setSelectedPostId}
                                        />
                                    ))
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Page {page + 1}</p>
                                    <p className="text-xs text-slate-500">
                                        {shouldUseAllPosts
                                            ? `${filteredPosts.length} posts loaded${allPostsQuery.hasNextPage ? ' (loading more...)' : ''}`
                                            : totalPages > 0
                                              ? `${totalPages} pages available`
                                              : 'Pagination will appear once posts are loaded'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage((current) => Math.max(0, current - 1))}
                                        disabled={shouldUseAllPosts || page === 0 || isLoading}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setPage((current) => current + 1)}
                                        disabled={
                                            shouldUseAllPosts ||
                                            isLoading ||
                                            (totalPages > 0 && page >= totalPages - 1)
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <CommunitySidebar
                            spotlightPosts={spotlightPosts}
                            popularCategories={popularCategories}
                        />
                    </div>

                    <PostDetailsModal
                        postId={selectedPostId}
                        onClose={() => setSelectedPostId(null)}
                    />
                </>
            ) : (
                <QuestionsSection />
            )}
        </div>
    )
}
