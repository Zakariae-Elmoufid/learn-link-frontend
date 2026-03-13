'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Eye, Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import {
    useComments,
    useCreateComment,
    useDeleteComment,
    useLikeComment,
    useMyProfile,
    usePost,
    useTogglePostLike,
    useUnlikeComment,
    useUpdateComment,
} from '../../hookes'
import type { PostCommentResponse } from '../../lib/api/types'
import { Avatar, Badge, Button, Skeleton, Textarea } from '../ui'
import { formatCategory, formatRelativeTime } from './utils'

interface PostDetailsModalProps {
    postId: number | null
    onClose: () => void
}

export function PostDetailsModal({ postId, onClose }: PostDetailsModalProps) {
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
                                    <Button
                                        type="submit"
                                        size="sm"
                                        loading={createComment.isPending}
                                        disabled={!commentText.trim()}
                                    >
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
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Student #{comment.userId}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-slate-400">
                                                            {formatRelativeTime(comment.createdAt)}
                                                        </span>
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

                                                {editingCommentId === comment.id ? (
                                                    <div className="mt-2 space-y-2">
                                                        <Textarea
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                            rows={3}
                                                            maxLength={1000}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                                                Cancel
                                                            </Button>
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
                                                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                                                            {comment.content}
                                                        </p>
                                                        <button
                                                            onClick={() => toggleCommentLike(comment.id)}
                                                            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                                                                likedCommentIds.has(comment.id)
                                                                    ? 'text-rose-500'
                                                                    : 'text-slate-400 hover:text-rose-500'
                                                            }`}
                                                        >
                                                            <Heart
                                                                className={`h-3.5 w-3.5 ${likedCommentIds.has(comment.id) ? 'fill-current' : ''}`}
                                                            />
                                                            {comment.likesCount}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No comments yet. Be the first to comment.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
