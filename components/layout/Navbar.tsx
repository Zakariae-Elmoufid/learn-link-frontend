'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Avatar } from '../ui'
import { useAuthStore } from '../../stores'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
    useNotificationRealtime,
    useNotificationUnreadCount,
    useUnreadNotifications,
} from '../../hookes/useNotifications'
import { NotificationResponse } from '../../lib/api/types'

interface NavbarProps {
    onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
    const router = useRouter()
    const user = useAuthStore((s) => s.user)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const notificationsRef = useRef<HTMLDivElement | null>(null)

    const { data: unreadCountData } = useNotificationUnreadCount()
    const unreadCount = unreadCountData?.unreadCount ?? 0

    const {
        data: unreadNotifications,
        isLoading: unreadLoading,
    } = useUnreadNotifications(0, 20, showNotifications)

    const markAsReadMutation = useMarkNotificationAsRead()
    const markAllAsReadMutation = useMarkAllNotificationsAsRead()

    useNotificationRealtime(true)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!notificationsRef.current) return
            if (!notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const notificationItems = useMemo(
        () => unreadNotifications?.content ?? [],
        [unreadNotifications]
    )

    const resolveAppLink = (rawLink?: string) => {
        if (!rawLink) return '/student'

        if (rawLink.startsWith('/community')) {
            return `/student${rawLink}`
        }
        if (rawLink.startsWith('/connections')) {
            return `/student${rawLink}`
        }
        if (rawLink.startsWith('/messages')) {
            return `/student${rawLink}`
        }
        if (rawLink.startsWith('/profile')) {
            return `/student${rawLink}`
        }

        return rawLink
    }

    const openNotification = async (notification: NotificationResponse) => {
        const targetLink = resolveAppLink(notification.data?.link)

        try {
            await markAsReadMutation.mutateAsync(notification.id)
        } catch {
            // Navigation should still happen even when read status fails.
        }

        setShowNotifications(false)
    }

    const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount)

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>


            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                                {badgeLabel}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-96 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllAsReadMutation.mutate()}
                                        disabled={markAllAsReadMutation.isPending}
                                        className="text-xs font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[24rem] overflow-y-auto">
                                {unreadLoading && (
                                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                        Loading notifications...
                                    </div>
                                )}

                                {!unreadLoading && notificationItems.length === 0 && (
                                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                        You are all caught up.
                                    </div>
                                )}

                                {!unreadLoading && notificationItems.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => openNotification(notification)}
                                        className="w-full border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 last:border-b-0 dark:border-slate-700 dark:hover:bg-slate-700/30"
                                    >
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {notification.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Avatar name={user?.username || 'User'} size="sm" />
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {user?.username || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user?.role || 'Student'}
                            </p>
                        </div>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <div className="p-2">
                                <a
                                    href="/dashboard/profile"
                                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    View Profile
                                </a>
                                <a
                                    href="/dashboard/settings"
                                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Settings
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
