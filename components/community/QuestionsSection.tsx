'use client'

import { FormEvent, useDeferredValue, useState } from 'react'
import { Eye, HelpCircle, MessageCircle, Search } from 'lucide-react'
import {
    useCreateQuestion,
    useMostViewedQuestions,
    useMyProfile,
    useQuestionSearch,
    useQuestions,
    useResolvedQuestions,
    useUnresolvedQuestions,
} from '../../hookes'
import { Badge, Button, Card, EmptyState, Input, Textarea } from '../ui'
import { PostCardSkeleton } from './PostCard'
import { QuestionDetailsModal } from './QuestionDetailsModal'
import { formatRelativeTime } from './utils'

type QuestionFeedMode = 'all' | 'unresolved' | 'resolved' | 'viewed'

export function QuestionsSection() {
    const { data: profile } = useMyProfile()
    const createQuestion = useCreateQuestion()
    const [page, setPage] = useState(0)
    const [mode, setMode] = useState<QuestionFeedMode>('all')
    const [searchInput, setSearchInput] = useState('')
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const deferredSearch = useDeferredValue(searchInput.trim())

    const allQuery = useQuestions(page, 10)
    const unresolvedQuery = useUnresolvedQuestions(page, 10)
    const resolvedQuery = useResolvedQuestions(page, 10)
    const viewedQuery = useMostViewedQuestions(page, 10)
    const searchQuery = useQuestionSearch(deferredSearch, page, 10)

    const activeQuery = deferredSearch
        ? searchQuery
        : mode === 'unresolved'
          ? unresolvedQuery
          : mode === 'resolved'
            ? resolvedQuery
            : mode === 'viewed'
              ? viewedQuery
              : allQuery

    const questions = activeQuery.data?.content ?? []
    const totalPages = activeQuery.data?.totalPages ?? 0

    const onSubmitQuestion = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        await createQuestion.mutateAsync({ title: title.trim(), content: content.trim() })
        setTitle('')
        setContent('')
    }

    return (
        <div className="space-y-6">
            <Card padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
                <form className="space-y-4" onSubmit={onSubmitQuestion}>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Ask a question</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Get help from the community and mark the best answer.
                            </p>
                        </div>
                    </div>

                    <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Question title"
                        minLength={5}
                        maxLength={255}
                        required
                    />
                    <Textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Describe the problem clearly with context and what you already tried"
                        minLength={10}
                        maxLength={5000}
                        rows={4}
                        required
                    />
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                            Signed in as {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Student'}
                        </p>
                        <Button type="submit" loading={createQuestion.isPending}>
                            Post Question
                        </Button>
                    </div>
                </form>
            </Card>

            <Card padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'unresolved', label: 'Unresolved' },
                            { value: 'resolved', label: 'Resolved' },
                            { value: 'viewed', label: 'Most Viewed' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    setMode(option.value as QuestionFeedMode)
                                    setPage(0)
                                }}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    mode === option.value
                                        ? 'bg-amber-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="w-full sm:w-80">
                        <Input
                            value={searchInput}
                            onChange={(event) => {
                                setSearchInput(event.target.value)
                                setPage(0)
                            }}
                            placeholder="Search questions"
                            icon={<Search className="h-4 w-4" />}
                        />
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                {activeQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={index} />)
                ) : questions.length === 0 ? (
                    <Card padding="lg" className="border border-dashed border-slate-300 bg-white">
                        <EmptyState
                            icon={<HelpCircle className="h-10 w-10" />}
                            title="No questions found"
                            description="Ask a new question or try another filter."
                        />
                    </Card>
                ) : (
                    questions.map((question) => (
                        <Card key={question.id} padding="lg" className="border border-slate-200/80 bg-white shadow-sm">
                            <button
                                type="button"
                                onClick={() => setSelectedQuestionId(question.id)}
                                className="w-full text-left"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-950 hover:text-amber-700 transition-colors">
                                            {question.title}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            {question.profilePictureUrl && (
                                                <img
                                                    src={question.profilePictureUrl}
                                                    alt={question.username}
                                                    className="h-5 w-5 rounded-full object-cover"
                                                />
                                            )}
                                            <p className="text-xs text-slate-400">
                                                Asked by <span className="font-medium text-slate-600">{question.username}</span> · {formatRelativeTime(question.createdAt)}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{question.content}</p>
                                    </div>
                                    <Badge variant={question.isResolved ? 'accent' : 'gray'}>
                                        {question.isResolved ? 'Resolved' : 'Open'}
                                    </Badge>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        {question.answers?.length ?? 0} answers
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Eye className="h-3.5 w-3.5" />
                                        {question.viewCount} views
                                    </span>
                                </div>
                            </button>
                        </Card>
                    ))
                )}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-sm text-slate-700">Page {page + 1}</p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((current) => Math.max(0, current - 1))}
                        disabled={page === 0 || activeQuery.isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={() => setPage((current) => current + 1)}
                        disabled={activeQuery.isLoading || (totalPages > 0 && page >= totalPages - 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <QuestionDetailsModal
                questionId={selectedQuestionId}
                onClose={() => setSelectedQuestionId(null)}
            />
        </div>
    )
}
