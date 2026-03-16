'use client'

import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'
import { 
    useAdminModerators, 
    useCreateModerator, 
    useUpdateModeratorPermissions, 
    useRemoveModerator,
    useAdminUsers
} from '../../../hookes'
import { 
    Shield, 
    Trash2, 
    Plus, 
    Edit2,
    Loader2,
    UserCheck,
    X,
    Check
} from 'lucide-react'

// Available permissions in the system based on the API definition
const AVAILABLE_PERMISSIONS = [
    "HIDE_POSTS",           // Can hide posts
    "HIDE_COMMENTS",        // Can hide comments
    "HIDE_QUESTIONS",       // Can hide questions
    "HIDE_ANSWERS",         // Can hide answers

    // User Management (limited)
    "VIEW_USER_DETAILS",    // Can view user details
    "WARN_USERS",           // Can send warnings to users

    // Reports
    "VIEW_REPORTS",         // Can view reported content
    "RESOLVE_REPORTS"
]

export default function AdminModeratorsPage() {
    const { data: moderators, isLoading } = useAdminModerators()
    const { data: usersData } = useAdminUsers({ size: 100, role: "STUDENT" })
    
    // Debug log
    console.log('Moderators data:', moderators)
    const createModerator = useCreateModerator()
    const updatePermissions = useUpdateModeratorPermissions()
    const removeModerator = useRemoveModerator()

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editModalData, setEditModalData] = useState<{ userId: number, permissions: string[] } | null>(null)
    const [deleteModalData, setDeleteModalData] = useState<{ userId: number, name: string } | null>(null)

    // Create Modal Form state
    const [newModUserId, setNewModUserId] = useState('')
    const [newModPermissions, setNewModPermissions] = useState<string[]>([])

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newModUserId) return
        
        createModerator.mutate(
            { userId: parseInt(newModUserId), permissions: newModPermissions },
            { onSuccess: () => setIsCreateModalOpen(false) }
        )
    }

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editModalData) return
        
        updatePermissions.mutate(
            { userId: editModalData.userId, data: { permissions: editModalData.permissions } },
            { onSuccess: () => setEditModalData(null) }
        )
    }

    const handleDelete = () => {
        if (!deleteModalData) return
        removeModerator.mutate(
            { userId: deleteModalData.userId, reason: 'Removed by admin from dashboard' },
            { onSuccess: () => setDeleteModalData(null) }
        )
    }

    const togglePermission = (permissions: string[], permission: string, setFn: (perms: string[]) => void) => {
        if (permissions.includes(permission)) {
            setFn(permissions.filter(p => p !== permission))
        } else {
            setFn([...permissions, permission])
        }
    }

    // Helper formatting
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateString))
    }

    const formatPermissionName = (perm: string) => {
        if (!perm) return ''
        return perm.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }


    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="h-8 w-8 text-indigo-500" />
                        Moderator Management
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Assign roles and configure permissions for platform moderators.
                    </p>
                </div>
                <Button 
                    onClick={() => {
                        setNewModUserId('')
                        setNewModPermissions([])
                        setIsCreateModalOpen(true)
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Plus className="h-4 w-4" /> Add Moderator
                </Button>
            </div>

            {/* Moderators List */}
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/80 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Moderator</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Allocated Permissions</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Assigned On</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                                        <p className="mt-2 text-slate-500">Loading moderators...</p>
                                    </td>
                                </tr>
                            ) : !moderators || moderators.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <Shield className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="font-medium text-slate-900 dark:text-slate-300">No moderators found</p>
                                        <p className="text-sm mt-1">Get started by adding a new moderator above.</p>
                                    </td>
                                </tr>
                            ) : (
                                moderators.map((mod) => (
                                    <tr key={mod.id} className="bg-white border-b dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800">
                                                    {mod.firstName?.charAt(0) || mod.username.charAt(0)}
                                                    {mod.lastName?.charAt(0) || ''}
                                                </div>
                                                <div>

                                                    <div className="text-xs text-slate-500">
                                                        {mod.username} • {mod.email}
                                                    </div>

                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            <div className="flex flex-wrap gap-1.5">
                                                {(() => {
                                                    if (!mod.permissions || mod.permissions.length === 0) {
                                                        return <span className="text-xs italic text-slate-400">No permissions</span>;
                                                    }
                                                    
                                                    return mod.permissions.map((p: any, idx: number) => {
                                                        // Handle both object format and simple string format
                                                        const name = typeof p === 'string' ? p : (p.permission || p.name || '');
                                                        const key = p.id || idx;
                                                        
                                                        if (!name) return null;
                                                        
                                                        return (
                                                            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                                                {formatPermissionName(name)}
                                                            </span>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 dark:text-slate-300 font-medium text-xs mb-1">
                                                {formatDate(mod.assignedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditModalData({
                                                        userId: mod.userId,
                                                        permissions: mod.permissions.map((p: any) => typeof p === 'string' ? p : (p.permission || ''))
                                                    })}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 rounded transition-colors"
                                                    title="Edit Permissions"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModalData({
                                                        userId: mod.userId,
                                                        name: `${mod.firstName} ${mod.lastName}`
                                                    })}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded transition-colors"
                                                    title="Remove Moderator"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 shadow-2xl relative border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <Plus className="w-5 h-5 text-indigo-500" />
                                Add Moderator
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Enter the User ID to grant moderator privileges and select initial permissions.
                            </p>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Target User
                                </label>

                                <select 
                                    id="user-list"
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                    value={newModUserId}
                                    onChange={(e) => setNewModUserId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a user to promote</option>
                                    {usersData?.content.map(user => (
                                        <option key={user.id} value={user.id.toString()}>
                                            {user.username} ({user.firstName} {user.lastName})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Permissions
                                </label>
                                <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 max-h-48 overflow-y-auto">
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const isSelected = newModPermissions.includes(perm)
                                        return (
                                            <div 
                                                key={perm}
                                                onClick={() => togglePermission(newModPermissions, perm, setNewModPermissions)}
                                                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </div>
                                                <span className="text-sm font-medium">{formatPermissionName(perm)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    disabled={!newModUserId || createModerator.isPending}
                                >
                                    {createModerator.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Moderator'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Edit Permissions Modal */}
            {editModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 shadow-2xl relative border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setEditModalData(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <Edit2 className="w-5 h-5 text-indigo-500" />
                                Edit Permissions
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Update capabilities for User ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{editModalData.userId}</span>
                            </p>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div>
                                <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 max-h-64 overflow-y-auto">
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const isSelected = editModalData.permissions.includes(perm)
                                        return (
                                            <div 
                                                key={perm}
                                                onClick={() => togglePermission(
                                                    editModalData.permissions, 
                                                    perm, 
                                                    (newPerms) => setEditModalData({ ...editModalData, permissions: newPerms })
                                                )}
                                                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </div>
                                                <span className="text-sm font-medium">{formatPermissionName(perm)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setEditModalData(null)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    disabled={updatePermissions.isPending}
                                >
                                    {updatePermissions.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <Card className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 shadow-2xl relative border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                Remove Moderator?
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                The moderation role will be revoked from <strong>{deleteModalData.name}</strong>. Their account will remain active as a regular user.
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <Button 
                                    className="flex-1"
                                    variant="outline" 
                                    onClick={() => setDeleteModalData(null)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleDelete}
                                    disabled={removeModerator.isPending}
                                >
                                    {removeModerator.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Remove Role'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
