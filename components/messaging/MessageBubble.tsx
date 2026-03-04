'use client'

import { MessageResponse } from '../../lib/api/types'
import { cn } from '../../lib/utils'
import { Check, CheckCheck, Clock, FileText, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

interface MessageBubbleProps {
    message: MessageResponse
    isOwn: boolean
    showAvatar?: boolean
}

export function MessageBubble({ message, isOwn, showAvatar = false }: MessageBubbleProps) {
    const formattedTime = format(new Date(message.createdAt), 'HH:mm')

    const renderStatusIcon = () => {
        switch (message.status) {
            case 'READ':
                return <CheckCheck className="h-3.5 w-3.5 text-primary-500" />
            case 'DELIVERED':
                return <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
            case 'SENT':
                return <Check className="h-3.5 w-3.5 text-slate-400" />
            default:
                return <Clock className="h-3.5 w-3.5 text-slate-400" />
        }
    }

    const renderAttachment = () => {
        if (!message.attachmentUrl) return null

        if (message.messageType === 'IMAGE') {
            return (
                <div className="mt-2 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={message.attachmentUrl}
                        alt={message.attachmentName || 'Image'}
                        className="max-w-full max-h-64 object-cover rounded-lg"
                    />
                </div>
            )
        }

        if (message.messageType === 'FILE') {
            return (
                <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        'mt-2 flex items-center gap-2 p-2 rounded-lg transition-colors',
                        isOwn
                            ? 'bg-primary-700 hover:bg-primary-800'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    )}
                >
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm truncate">{message.attachmentName || 'File'}</span>
                </a>
            )
        }

        return null
    }

    return (
        <div
            className={cn(
                'flex gap-2 max-w-[75%]',
                isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
        >
            <div
                className={cn(
                    'px-4 py-2 rounded-2xl',
                    isOwn
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
                )}
            >
                {message.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )}
                
                {renderAttachment()}

                <div
                    className={cn(
                        'flex items-center gap-1 mt-1',
                        isOwn ? 'justify-end' : 'justify-start'
                    )}
                >
                    <span
                        className={cn(
                            'text-xs',
                            isOwn ? 'text-primary-200' : 'text-slate-500 dark:text-slate-400'
                        )}
                    >
                        {formattedTime}
                    </span>
                    {isOwn && renderStatusIcon()}
                </div>
            </div>
        </div>
    )
}
