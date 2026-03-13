'use client'

import { FormEvent, useState } from 'react'
import { PenSquare } from 'lucide-react'
import { useCreatePost } from '../../hookes'
import type { PostCategory, PostType } from '../../lib/api/types'
import { Button, Card, Input, Textarea } from '../ui'
import { formatCategory } from './utils'

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

export function PostComposer() {
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
