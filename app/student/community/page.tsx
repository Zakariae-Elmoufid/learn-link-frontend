'use client'

import { FormEvent, memo, useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
    BookOpen,
    Eye,
    Flame,
    Heart,
    MessageCircle,
    Pencil,
    PenSquare,
    Search,
    Sparkles,
    Trash2,
    TrendingUp,
} from 'lucide-react'
import {
    useAllPosts,
    useComments,
    useCreateComment,
    useCreatePost,
    useDeleteComment,
    useLikeComment,
    useMyProfile,
    usePost,
    usePopularPosts,
    usePosts,
    useSearchPosts,
    useTogglePostLike,
    useTrendingPosts,
    useUnlikeComment,
    useUpdateComment,
} from '../../../hookes'
import { PostCategory, PostCommentResponse, PostResponse, PostType } from '../../../lib/api/types'
import {
    Avatar,
    Badge,
    Button,
    Card,
    EmptyState,
    Input,
    Skeleton,
    Textarea,
} from '../../../components/ui'

type CommunityTab = 'ALL' | PostType
type FeedMode = 'recent' | 'popular' | 'trending'

const tabOptions: Array<{ value: CommunityTab; label: string }> = [
    { value: 'ALL', label: 'All Posts' },
    { value: 'DISCUSSION', label: 'Discussions' },
    { value: 'TUTORIAL', label: 'Tutorials' },
    { value: 'SUMMARY', label: 'Summaries' },
]

const categoryOptions: PostCategory[] = [
    'MATHEMATICS',
    'SCIENCE',
    'LANGUAGES',
    'PROGRAMMING',
    'HISTORY',
    'LITERATURE',
    'PHYSICS',
    'CHEMISTRY',
    'BIOLOGY',
    'ECONOMICS',
    'OTHER',
]

const feedOptions: Array<{ value: FeedMode; label: string }> = [
    { value: 'recent', label: 'Recent' },
    { value: 'popular', label: 'Popular' },
    { value: 'trending', label: 'Trending' },
]

function formatRelativeTime(timestamp: string) {
    const date = new Date(timestamp)
    const diffMs = Date.now() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min ago`
    if (diffHours < 24) return `${diffHours} hr ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

function formatCategory(category: PostCategory) {
    return category.charAt(0) + category.slice(1).toLowerCase()
}

function PostComposer() {
    const createPost = useCreatePost()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [type, setType] = useState<PostType>('DISCUSSION')
    const [category, setCategory] = useState<PostCategory>('PROGRAMMING')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        await createPost.mutateAsync({
            title,
            content,
            type,
            category,
        })

        setTitle('')
        setContent('')
        setType('DISCUSSION')
        setCategory('PROGRAMMING')
    }

    return (
        <Card padding="lg" className="border border-slate-200/80 bg-white/95 shadow-sm">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                        <PenSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-slate-900">Share something useful</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Post a summary, tutorial, or discussion for the community.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                    <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Post title"
                        minLength={5}
                        maxLength={255}
                        required
                    />
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value as PostType)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                        <option value="DISCUSSION">Discussion</option>
                        <option value="TUTORIAL">Tutorial</option>
                        <option value="SUMMARY">Summary</option>
                    </select>
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value as PostCategory)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                        {categoryOptions.map((option) => (
                            <option key={option} value={option}>
                                {formatCategory(option)}
                            </option>
                        ))}
                    </select>
                </div>

                <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="What are you sharing with the community today?"
                    minLength={10}
                    maxLength={5000}
                    rows={4}
                    required
                />

                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                        Keep it useful, specific, and easy for other students to act on.
                    </p>
                    <Button type="submit" loading={createPost.isPending}>
                        Publish Post
                    </Button>
                </div>
            </form>
        </Card>
    )
}

const PostCard = memo(function PostCard({
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

function PostCardSkeleton() {
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

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<CommunityTab>('ALL')
    const [feedMode, setFeedMode] = useState<FeedMode>('recent')
    const [page, setPage] = useState(0)
    const [searchInput, setSearchInput] = useState('')
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
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

    const spotlightPosts = useMemo(() => trendingQuery.data?.content.slice(0, 3) ?? [], [trendingQuery.data?.content])
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
                            <p className="mt-2 text-2xl font-bold text-slate-950">{totalElements || postsQuery.data?.totalElements || 0}</p>
                        </Card>
                        <Card padding="md" className="min-w-[160px] border border-white/70 bg-white/80 backdrop-blur">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Trending now</p>
                            <p className="mt-2 text-2xl font-bold text-slate-950">{trendingQuery.data?.content.length ?? 0}</p>
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
                                disabled={shouldUseAllPosts || isLoading || (totalPages > 0 && page >= totalPages - 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>

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
                                            <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post.likesCount}</span>
                                            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.commentsCount}</span>
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
            </div>

            <PostDetailsModal
                postId={selectedPostId}
                onClose={() => setSelectedPostId(null)}
            />
        </div>
    )
}

function PostDetailsModal({
    postId,
    onClose,
}: {
    postId: number | null
    onClose: () => void
}) {
    const { data: profile } = useMyProfile()
    const { data: post, isLoading: isPostLoading } = usePost(postId)
    const { data: comments, isLoading: isCommentsLoading } = useComments(postId)
    const createComment = useCreateComment()
    const updateComment = useUpdateComment()
    const deleteComment = useDeleteComment()
    const likeComment = useLikeComment()
    const unlikeComment = useUnlikeComment()
    const { toggle, isLoading: isLikeLoading } = useTogglePostLike()
    const [commentText, setCommentText] = useState('')
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
    const [editingText, setEditingText] = useState('')
    const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(new Set())

    useEffect(() => {
        if (!postId) {
            setCommentText('')
            setEditingCommentId(null)
            setEditingText('')
        }
    }, [postId])

    if (!postId) return null

    const currentUserId = profile?.userId

    const submitComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const content = commentText.trim()
        if (!content) return

        await createComment.mutateAsync({ postId, data: { content } })
        setCommentText('')
    }

    const startEdit = (comment: PostCommentResponse) => {
        setEditingCommentId(comment.id)
        setEditingText(comment.content)
    }

    const cancelEdit = () => {
        setEditingCommentId(null)
        setEditingText('')
    }

    const saveEdit = async () => {
        if (!editingCommentId || !editingText.trim()) return
        await updateComment.mutateAsync({
            commentId: editingCommentId,
            data: { content: editingText.trim() },
        })
        setEditingCommentId(null)
        setEditingText('')
    }

    const handleDeleteComment = (comment: PostCommentResponse) => {
        deleteComment.mutate({
            commentId: comment.id,
            postId: comment.postId ?? postId,
        })
    }

    const toggleCommentLike = (commentId: number) => {
        if (likedCommentIds.has(commentId)) {
            unlikeComment.mutate(commentId)
            setLikedCommentIds((prev) => {
                const next = new Set(prev)
                next.delete(commentId)
                return next
            })
        } else {
            likeComment.mutate(commentId)
            setLikedCommentIds((prev) => new Set(prev).add(commentId))
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">Post Details</h2>
                    <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                </div>

                {isPostLoading || !post ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar name={`User ${post.userId}`} size="md" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Student #{post.userId}</p>
                                        <p className="text-xs text-slate-400">{formatRelativeTime(post.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="primary">{post.type}</Badge>
                                    <Badge variant="gray">{formatCategory(post.category)}</Badge>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-950">{post.title}</h3>
                            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{post.content}</p>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Heart className={`h-4 w-4 ${post.likedByCurrentUser ? 'fill-current text-rose-500' : ''}`} />
                                        {post.likesCount}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <MessageCircle className="h-4 w-4" />
                                        {post.commentsCount}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        {post.viewCount}
                                    </span>
                                </div>
                                <Button
                                    variant={post.likedByCurrentUser ? 'secondary' : 'outline'}
                                    size="sm"
                                    disabled={isLikeLoading}
                                    onClick={() => toggle(post.id, post.likedByCurrentUser)}
                                >
                                    <Heart className={`h-4 w-4 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />
                                    {post.likedByCurrentUser ? 'Liked' : 'Like'}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-slate-200 p-4">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Comments ({comments?.length ?? 0})
                            </h3>
                            <form className="mt-3 space-y-3" onSubmit={submitComment}>
                                <div className="flex items-start gap-3">
                                    <Avatar name={profile?.firstName || 'You'} size="sm" />
                                    <div className="flex-1">
                                        <Textarea
                                            value={commentText}
                                            onChange={(event) => setCommentText(event.target.value)}
                                            placeholder="Share your thoughts..."
                                            rows={3}
                                            minLength={2}
                                            maxLength={1000}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" size="sm" loading={createComment.isPending} disabled={!commentText.trim()}>
                                        Post Comment
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                                {isCommentsLoading ? (
                                    Array.from({ length: 2 }).map((_, index) => (
                                        <div key={index} className="flex gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        </div>
                                    ))
                                ) : comments && comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar name={`User ${comment.userId}`} size="sm" />
                                            <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-4 py-3">
                                                {/* Header row */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-slate-900">Student #{comment.userId}</p>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                                                        {currentUserId === comment.userId && (
                                                            <>
                                                                <button
                                                                    onClick={() => startEdit(comment)}
                                                                    className="ml-1 rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment)}
                                                                    disabled={deleteComment.isPending}
                                                                    className="rounded p-1 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Edit mode */}
                                                {editingCommentId === comment.id ? (
                                                    <div className="mt-2 space-y-2">
                                                        <Textarea
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                            rows={3}
                                                            maxLength={1000}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                                                            <Button
                                                                size="sm"
                                                                loading={updateComment.isPending}
                                                                disabled={!editingText.trim()}
                                                                onClick={saveEdit}
                                                            >
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{comment.content}</p>
                                                        {/* Like button */}
                                                        <button
                                                            onClick={() => toggleCommentLike(comment.id)}
                                                            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                                                                likedCommentIds.has(comment.id)
                                                                    ? 'text-rose-500'
                                                                    : 'text-slate-400 hover:text-rose-500'
                                                            }`}
                                                        >
                                                            <Heart className={`h-3.5 w-3.5 ${likedCommentIds.has(comment.id) ? 'fill-current' : ''}`} />
                                                            {comment.likesCount}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">No comments yet. Be the first to comment.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}