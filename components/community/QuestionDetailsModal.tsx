'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowBigDown, ArrowBigUp, Check, Pencil, Trash2 } from 'lucide-react'
import {
    useAcceptAnswer,
    useCreateAnswer,
    useDeleteAnswer,
    useDeleteQuestion,
    useMyProfile,
    useQuestion,
    useQuestionAnswers,
    useRemoveAnswerVote,
    useUpdateAnswer,
    useUpdateQuestion,
    useVoteAnswer,
} from '../../hookes'
import { useAuthStore } from '../../stores'
import type { AnswerResponse, VoteType } from '../../lib/api/types'
import { Avatar, Badge, Button, Input, Skeleton, Textarea } from '../ui'
import { formatRelativeTime } from './utils'

interface QuestionDetailsModalProps {
    questionId: number | null
    onClose: () => void
}

export function QuestionDetailsModal({ questionId, onClose }: QuestionDetailsModalProps) {
    const { data: profile, isLoading: isProfileLoading } = useMyProfile()
    const { data: question, isLoading: isQuestionLoading } = useQuestion(questionId)
    const { data: answers, isLoading: isAnswersLoading } = useQuestionAnswers(questionId)
    const authUser = useAuthStore((s) => s.user)
    const updateQuestion = useUpdateQuestion()
    const deleteQuestion = useDeleteQuestion()
    const createAnswer = useCreateAnswer()
    const updateAnswer = useUpdateAnswer()
    const deleteAnswer = useDeleteAnswer()
    const acceptAnswer = useAcceptAnswer()
    const voteAnswer = useVoteAnswer()
    const removeVote = useRemoveAnswerVote()

    const [answerText, setAnswerText] = useState('')
    const [editingQuestion, setEditingQuestion] = useState(false)
    const [editingQuestionTitle, setEditingQuestionTitle] = useState('')
    const [editingQuestionContent, setEditingQuestionContent] = useState('')
    const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null)
    const [editingAnswerText, setEditingAnswerText] = useState('')

    useEffect(() => {
        if (!question) return
        setEditingQuestionTitle(question.title)
        setEditingQuestionContent(question.content)
    }, [question?.id, question?.title, question?.content])

    if (!questionId) return null

    // Get current user ID from auth store
    const currentUserId = authUser?.id ?? null

    const saveQuestionEdit = async () => {
        if (!question) return
        await updateQuestion.mutateAsync({
            questionId: question.id,
            data: {
                title: editingQuestionTitle.trim(),
                content: editingQuestionContent.trim(),
            },
        })
        setEditingQuestion(false)
    }

    const handleDeleteQuestion = async () => {
        if (!question) return
        await deleteQuestion.mutateAsync(question.id)
        onClose()
    }

    const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const content = answerText.trim()
        if (!content) return
        await createAnswer.mutateAsync({ questionId, data: { content } })
        setAnswerText('')
    }

    const startEditAnswer = (answer: AnswerResponse) => {
        setEditingAnswerId(answer.id)
        setEditingAnswerText(answer.content)
    }

    const saveEditAnswer = async () => {
        if (!editingAnswerId || !editingAnswerText.trim()) return
        await updateAnswer.mutateAsync({
            answerId: editingAnswerId,
            data: { content: editingAnswerText.trim() },
        })
        setEditingAnswerId(null)
        setEditingAnswerText('')
    }

    const castVote = async (answerId: number, voteType: VoteType, currentVote: boolean | null) => {
        if (!questionId) return
        if (
            (voteType === 'UPVOTE' && currentVote === true) ||
            (voteType === 'DOWNVOTE' && currentVote === false)
        ) {
            await removeVote.mutateAsync({ answerId, questionId })
            return
        }
        await voteAnswer.mutateAsync({ answerId, questionId, voteType })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">Question Details</h2>
                    <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                </div>

                {isQuestionLoading || !question ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-950">{question.title}</h3>
                                    <div className="mt-2 flex items-center gap-2">
                                        {question.profilePictureUrl && (
                                            <img
                                                src={question.profilePictureUrl}
                                                alt={question.username}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                        )}
                                        <p className="text-xs text-slate-400">
                                            Asked by <span className="font-medium text-slate-700">{question.username}</span> · {formatRelativeTime(question.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={question.isResolved ? 'accent' : 'gray'}>
                                        {question.isResolved ? 'Resolved' : 'Open'}
                                    </Badge>
                                    {question.userId === currentUserId && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setEditingQuestion((value) => !value)}
                                                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDeleteQuestion}
                                                className="rounded p-1 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingQuestion ? (
                                <div className="mt-4 space-y-3">
                                    <Input
                                        value={editingQuestionTitle}
                                        onChange={(event) => setEditingQuestionTitle(event.target.value)}
                                        minLength={5}
                                        maxLength={255}
                                    />
                                    <Textarea
                                        value={editingQuestionContent}
                                        onChange={(event) => setEditingQuestionContent(event.target.value)}
                                        rows={4}
                                        minLength={10}
                                        maxLength={5000}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingQuestion(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            loading={updateQuestion.isPending}
                                            disabled={
                                                !editingQuestionTitle.trim() || !editingQuestionContent.trim()
                                            }
                                            onClick={saveQuestionEdit}
                                        >
                                            Save Question
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                                    {question.content}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 rounded-xl border border-slate-200 p-4">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Answers ({answers?.length ?? 0})
                            </h3>
                            <form className="mt-3 space-y-3" onSubmit={submitAnswer}>
                                <Textarea
                                    value={answerText}
                                    onChange={(event) => setAnswerText(event.target.value)}
                                    placeholder="Write your answer..."
                                    rows={4}
                                    minLength={10}
                                    maxLength={5000}
                                    required
                                />
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        loading={createAnswer.isPending}
                                        disabled={!answerText.trim()}
                                    >
                                        Post Answer
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                                {isAnswersLoading ? (
                                    Array.from({ length: 2 }).map((_, index) => (
                                        <div key={index} className="flex gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        </div>
                                    ))
                                ) : answers && answers.length > 0 ? (
                                    answers.map((answer) => (
                                        <div key={answer.id} className="rounded-xl bg-slate-50 px-4 py-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    {answer.profilePictureUrl && (
                                                        <img
                                                            src={answer.profilePictureUrl}
                                                            alt={answer.username}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {answer.username}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {formatRelativeTime(answer.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {answer.isAccepted && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                            <Check className="h-3.5 w-3.5" />
                                                            Accepted
                                                        </span>
                                                    )}
                                                    {currentUserId &&
                                                        question?.userId === currentUserId &&
                                                        !question?.isResolved &&
                                                        !answer.isAccepted && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                loading={acceptAnswer.isPending}
                                                                onClick={() =>
                                                                    acceptAnswer.mutate({
                                                                        answerId: answer.id,
                                                                        questionId: question.id,
                                                                    })
                                                                }
                                                            >
                                                                Accept
                                                            </Button>
                                                        )}

                                                    {answer.userId === currentUserId && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => startEditAnswer(answer)}
                                                                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteAnswer.mutate({
                                                                        answerId: answer.id,
                                                                        questionId: question.id,
                                                                    })
                                                                }
                                                                className="rounded p-1 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {editingAnswerId === answer.id ? (
                                                <div className="mt-2 space-y-2">
                                                    <Textarea
                                                        value={editingAnswerText}
                                                        onChange={(event) =>
                                                            setEditingAnswerText(event.target.value)
                                                        }
                                                        rows={3}
                                                        maxLength={5000}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingAnswerId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            loading={updateAnswer.isPending}
                                                            onClick={saveEditAnswer}
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                                        {answer.content}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                castVote(
                                                                    answer.id,
                                                                    'UPVOTE',
                                                                    answer.votedByCurrentUser,
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                                answer.votedByCurrentUser === true
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <ArrowBigUp className="h-3.5 w-3.5" />
                                                            {answer.upvoteCount}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                castVote(
                                                                    answer.id,
                                                                    'DOWNVOTE',
                                                                    answer.votedByCurrentUser,
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                                answer.votedByCurrentUser === false
                                                                    ? 'bg-rose-100 text-rose-700'
                                                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <ArrowBigDown className="h-3.5 w-3.5" />
                                                            {answer.downvoteCount}
                                                        </button>
                                                        <span className="ml-1 text-xs font-semibold text-slate-500">
                                                            Score {answer.voteCount}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No answers yet. Be the first to help.
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
