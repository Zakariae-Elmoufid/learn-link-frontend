'use client'

import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'
import { 
    useAdminUsers, 
    useActivateUser, 
    useDeactivateUser, 
    useChangeUserRole 
} from '../../../hookes'
import { 
    Search, 
    MoreVertical, 
    UserX, 
    UserCheck, 
    Shield, 
    ShieldAlert, 
    GraduationCap, 
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react'

export default function AdminUsersPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
    
    // Manage user actions menu state
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null)

    // Setup fetching data
    const queryParams = {
        page,
        size: 10,
        search: search || undefined,
        role: roleFilter,
        active: activeFilter,
        sortBy: 'createdAt',
        sortDirection: 'desc'
    }

    const { data: usersData, isLoading } = useAdminUsers(queryParams)
    
    // Mutations for user actions
    const activateUser = useActivateUser()
    const deactivateUser = useDeactivateUser()
    const changeRole = useChangeUserRole()

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSearch(searchInput)
        setPage(0)
    }

    const clearFilters = () => {
        setSearch('')
        setSearchInput('')
        setRoleFilter(undefined)
        setActiveFilter(undefined)
        setPage(0)
    }

    // Role display helpers
    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'ADMIN': return <ShieldAlert className="w-4 h-4 text-red-500" />
            case 'MODERATOR': return <Shield className="w-4 h-4 text-orange-500" />
            case 'INSTRUCTOR': return <GraduationCap className="w-4 h-4 text-blue-500" />
            default: return <UserCheck className="w-4 h-4 text-slate-500" />
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch(role) {
            case 'ADMIN': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            case 'MODERATOR': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            case 'INSTRUCTOR': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }
    }

    const statusBadge = (active: boolean) => {
        if (active) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</span>
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Inactive</span>
    }

    // Date formatter
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateString))
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        View and manage all user accounts across the platform.
                    </p>
                </div>
                {usersData && (
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium">
                        <span className="text-primary-600 dark:text-primary-400">{usersData.totalElements}</span> Total Users
                    </div>
                )}
            </div>

            {/* Filters and Search */}
            <Card className="p-4 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search bar */}
                    <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name, username or email..."
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900"
                            />
                        </div>
                        <Button type="submit" variant="primary" className="px-4">Search</Button>
                    </form>

                    {/* Filter dropdowns */}
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 lg:pl-4 lg:border-l border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
                            <select
                                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 dark:bg-slate-900 dark:border-slate-700 dark:placeholder-slate-400 dark:text-white"
                                value={roleFilter || ''}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value || undefined)
                                    setPage(0)
                                }}
                            >
                                <option value="">All Roles</option>
                                <option value="STUDENT">Student</option>
                                <option value="INSTRUCTOR">Instructor</option>
                                <option value="MODERATOR">Moderator</option>
                                <option value="ADMIN">Admin</option>
                            </select>

                            <select
                                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 dark:bg-slate-900 dark:border-slate-700 dark:placeholder-slate-400 dark:text-white"
                                value={activeFilter === undefined ? '' : activeFilter.toString()}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setActiveFilter(val === '' ? undefined : val === 'true')
                                    setPage(0)
                                }}
                            >
                                <option value="">All Statuses</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        
                        {(search || roleFilter || activeFilter !== undefined) && (
                            <button 
                                onClick={clearFilters}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-2 py-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/80 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">User</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Role</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Joined / Activity</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                                        <p className="mt-2 text-slate-500">Loading users...</p>
                                    </td>
                                </tr>
                            ) : usersData?.content.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                usersData?.content.map((user) => (
                                    <tr key={user.id} className="bg-white border-b dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                                    {user.firstName?.charAt(0) || user.username.charAt(0)}
                                                    {user.lastName?.charAt(0) || ''}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        @{user.username} • {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {statusBadge(user.active)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 dark:text-slate-300 font-medium text-xs mb-1">
                                                Joined: {formatDate(user.createdAt)}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Lvl {user.level} • {user.totalPoints} pts
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            {/* Action Menu Toggle */}
                                            <button 
                                                onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                            </button>

                                            {/* Action Dropdown Menu */}
                                            {activeMenuId === user.id && (
                                                <>
                                                    <div 
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActiveMenuId(null)}
                                                    />
                                                    <div className="absolute right-8 top-12 z-20 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden py-1">
                                                        <div className="px-3 py-2 text-xs font-semibold uppercase text-slate-500 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">Actions</div>
                                                        
                                                        {/* Status Toggle Action */}
                                                        {user.active ? (
                                                            <button 
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                                                                onClick={() => {
                                                                    deactivateUser.mutate(user.id)
                                                                    setActiveMenuId(null)
                                                                }}
                                                                disabled={deactivateUser.isPending}
                                                            >
                                                                <UserX className="w-4 h-4" /> Deactivate User
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                                                                onClick={() => {
                                                                    activateUser.mutate(user.id)
                                                                    setActiveMenuId(null)
                                                                }}
                                                                disabled={activateUser.isPending}
                                                            >
                                                                <UserCheck className="w-4 h-4" /> Activate User
                                                            </button>
                                                        )}

                                                        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700 text-xs font-semibold uppercase text-slate-500 bg-slate-50 dark:bg-slate-900/50">Change Role To</div>
                                                        
                                                        <div className="max-h-32 overflow-y-auto">
                                                            {['STUDENT', 'INSTRUCTOR', 'MODERATOR', 'ADMIN'].map(role => (
                                                                role !== user.role && (
                                                                    <button
                                                                        key={role}
                                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary-600 dark:hover:text-primary-400 capitalize transition-colors"
                                                                        onClick={() => {
                                                                            changeRole.mutate({ userId: user.id, role })
                                                                            setActiveMenuId(null)
                                                                        }}
                                                                        disabled={changeRole.isPending}
                                                                    >
                                                                        {role.toLowerCase()}
                                                                    </button>
                                                                )
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {usersData && usersData.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Showing page <span className="font-semibold text-slate-900 dark:text-white">{page + 1}</span> of <span className="font-semibold text-slate-900 dark:text-white">{usersData.totalPages}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={usersData.first}
                                className="p-1 px-3 flex items-center gap-1 rounded border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={usersData.last}
                                className="p-1 px-3 flex items-center gap-1 rounded border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 text-sm font-medium"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
