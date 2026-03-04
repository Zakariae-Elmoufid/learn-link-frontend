'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MessageInputProps {
    onSendMessage: (content: string) => void
    disabled?: boolean
    placeholder?: string
}

export function MessageInput({ onSendMessage, disabled, placeholder = 'Type a message...' }: MessageInputProps) {
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = () => {
        const trimmedMessage = message.trim()
        if (!trimmedMessage || disabled) return

        onSendMessage(trimmedMessage)
        setMessage('')

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-end gap-2">
                {/* Attachment buttons */}
                <div className="flex items-center gap-1 pb-2">
                    <button
                        type="button"
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Attach file"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Send image"
                    >
                        <ImageIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Input field */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            'w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700',
                            'bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-12',
                            'text-sm text-slate-900 dark:text-white placeholder:text-slate-400',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    />
                    <button
                        type="button"
                        className="absolute right-2 bottom-2 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        title="Emoji"
                    >
                        <Smile className="h-5 w-5" />
                    </button>
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className={cn(
                        'p-3 rounded-xl transition-colors mb-0.5',
                        message.trim() && !disabled
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    )}
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}
