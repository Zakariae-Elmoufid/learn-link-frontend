'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
    useConnections, 
    useConnectionsCount,
    useRemoveConnection 
} from '../../../../hookes'
import { ConnectionResponse } from '../../../../lib/api/types'
import { useMessageStore } from '../../../../stores'
import { Button, Input } from '../../../../components/ui'
import { 
    Search, 
    MessageSquare, 
    LayoutGrid, 
    List, 
    Filter,
    Users,
    Loader2,
    UserMinus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import Image from 'next/image'

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'mutual' | 'online'
type SortOption = 'recent' | 'name' | 'compatibility'

const ITEMS_PER_PAGE = 6

// Format academic level
function formatAcademicLevel(level: string): string {
    const map: Record<string, string> = {
        HIGH_SCHOOL: 'High School',
        UNDERGRADUATE: 'Undergraduate',
        GRADUATE: 'Graduate',
        POSTGRADUATE: 'Postgraduate',
        PROFESSIONAL: 'Professional',
        FRESHMAN: 'Freshman',
        SOPHOMORE: 'Sophomore',
        JUNIOR: 'Junior',
        SENIOR: 'Senior',
    }
    return map[level] || level
}

// Connection Card Component
function ConnectionCard({ 
    connection, 
    onMessage,
    onRemove,
    isRemoving
}: { 
    connection: ConnectionResponse
    onMessage: (connection: ConnectionResponse) => void
    onRemove: (connectionId: number) => void
    isRemoving: boolean
}) {
    const fullName = `${connection.firstName} ${connection.lastName}`

    // Mock subjects - in a real app these would come from the connection data
    const subjects = connection.bio?.split(',').slice(0, 3).map(s => s.trim()).filter(Boolean) || []

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            {/* Header with avatar and info */}
            <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    {connection.profilePictureUrl ? (
                        <Image
                            src={connection.profilePictureUrl}
                            alt={fullName}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-lg font-semibold text-primary-600 bg-primary-100 dark:bg-primary-900/30">
                            {connection.firstName?.charAt(0)}{connection.lastName?.charAt(0)}
                        </div>
                    )}
                    {/* Online indicator - mock for now */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800" />
                </div>

                {/* Name and level */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {fullName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatAcademicLevel(connection.academicLevel)}
                    </p>
                </div>
            </div>

            {/* Subjects/Interests tags */}
            {subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {subjects.map((subject, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        >
                            {subject}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onMessage(connection)}
                    className="flex-1"
                >
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    Message
                </Button>
                
                {/* Remove Connection Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(connection.id)}
                    loading={isRemoving}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                    <UserMinus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function MyConnectionsPage() {
    const router = useRouter()
    
    // State
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<FilterType>('all')
    const [sortBy, setSortBy] = useState<SortOption>('recent')
    const [currentPage, setCurrentPage] = useState(1)
    const [removingId, setRemovingId] = useState<number | null>(null)

    // Queries
    const { data: connections, isLoading } = useConnections()
    const { data: countData } = useConnectionsCount()

    // Mutations
    const removeConnection = useRemoveConnection()

    // Filter and sort connections
    const filteredConnections = useMemo(() => {
        if (!connections) return []

        let filtered = [...connections]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(c => 
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
                c.bio?.toLowerCase().includes(query) ||
                c.academicLevel?.toLowerCase().includes(query)
            )
        }

        // Sort
        switch (sortBy) {
            case 'recent':
                filtered.sort((a, b) => 
                    new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime()
                )
                break
            case 'name':
                filtered.sort((a, b) => 
                    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                )
                break
            case 'compatibility':
                filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                break
        }

        return filtered
    }, [connections, searchQuery, sortBy])

    // Pagination
    const totalPages = Math.ceil(filteredConnections.length / ITEMS_PER_PAGE)
    const paginatedConnections = filteredConnections.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Access message store
    const { setPendingConversationUser, setActiveConversation, conversations } = useMessageStore()

    // Handlers
    const handleMessage = (connection: ConnectionResponse) => {
        // Check if conversation already exists
        const existingConversation = conversations.find(c => c.participantId === connection.connectedUserId)
        
        if (!existingConversation) {
            // Set pending conversation user for new chat
            setPendingConversationUser({
                id: connection.connectedUserId,
                firstName: connection.firstName,
                lastName: connection.lastName,
                profilePictureUrl: connection.profilePictureUrl,
            })
        }
        
        // Set active conversation and navigate
        setActiveConversation(connection.connectedUserId)
        router.push('/student/messages')
    }

    const handleRemove = async (connectionId: number) => {
        setRemovingId(connectionId)
        try {
            await removeConnection.mutateAsync(connectionId)
        } finally {
            setRemovingId(null)
        }
    }

    const totalConnections = countData?.count ?? connections?.length ?? 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 mb-1">
                        <Users className="h-4 w-4" />
                        Networking
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        My Connections
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        You have <span className="font-semibold text-slate-900 dark:text-white">{totalConnections}</span> active academic connections.
                    </p>
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-3">
                    {/* Sort dropdown */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                        >
                            <option value="recent">Recent</option>
                            <option value="name">Name</option>
                            <option value="compatibility">Compatibility</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <Input
                        placeholder="Find a connection by name, major, or interest..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        icon={<Search className="h-4 w-4" />}
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filterType === 'all'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('mutual')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filterType === 'mutual'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                    >
                        Mutual Groups
                    </button>
                    <button
                        onClick={() => setFilterType('online')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filterType === 'online'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                    >
                        Online
                    </button>
                </div>

                {/* Filter button */}
                <button className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors">
                    <Filter className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            ) : !paginatedConnections || paginatedConnections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {searchQuery ? 'No connections found' : 'No connections yet'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        {searchQuery
                            ? "Try adjusting your search to find connections."
                            : "Start connecting with study partners to grow your network!"}
                    </p>
                    {!searchQuery && (
                        <Button
                            variant="primary"
                            className="mt-4"
                            onClick={() => router.push('/student/connections' as any)}
                        >
                            Find Study Partners
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    {/* Connections grid */}
                    <div className={`grid gap-4 ${
                        viewMode === 'grid' 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                            : 'grid-cols-1'
                    }`}>
                        {paginatedConnections.map((connection) => (
                            <ConnectionCard
                                key={connection.id}
                                connection={connection}
                                onMessage={handleMessage}
                                onRemove={handleRemove}
                                isRemoving={removingId === connection.id}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredConnections.length)} of {filteredConnections.length} connections
                        </p>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            
                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-primary-600 text-white'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
