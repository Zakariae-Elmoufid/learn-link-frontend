'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Avatar } from '../ui'
import { useAuthStore } from '../../stores'
import { useState } from 'react'

interface NavbarProps {
    onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
    const user = useAuthStore((s) => s.user)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfile, setShowProfile] = useState(false)

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
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                            </div>
                            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                No new notifications
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
