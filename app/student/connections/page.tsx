'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
    useMatchSuggestions, 
    useMatchSuggestionsBySubject, 
    useSendConnectionRequest,
    useSubjects 
} from '../../../hookes'
import { StudyPartnerCard, StudyPartnerCardSkeleton } from '../../../components/connections'
import { Button, Input } from '../../../components/ui'
import { 
    Search, 
    Filter, 
    LayoutGrid, 
    List, 
    Sparkles, 
    ChevronDown,
    Info,
    ArrowRight,
    RefreshCw
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortOption = 'compatibility' | 'name' | 'recent'

export default function ConnectionsPage() {
    const router = useRouter()
    
    // State
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>('compatibility')
    const [showFilters, setShowFilters] = useState(false)
    const [connectingUserId, setConnectingUserId] = useState<number | null>(null)
    const [limit, setLimit] = useState(12)

    // Queries
    const { data: subjects } = useSubjects()
    const { 
        data: suggestions, 
        isLoading, 
        refetch,
        isFetching 
    } = selectedSubjectId 
        ? useMatchSuggestionsBySubject(selectedSubjectId, 50)
        : useMatchSuggestions(50)
    
    // Mutations
    const sendConnectionRequest = useSendConnectionRequest()

    // Filter and sort suggestions
    const filteredSuggestions = useMemo(() => {
        if (!suggestions) return []

        let filtered = [...suggestions]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(s => 
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
                s.bio?.toLowerCase().includes(query) ||
                s.commonSubjects?.some(sub => sub.toLowerCase().includes(query))
            )
        }

        // Sort
        switch (sortBy) {
            case 'compatibility':
                filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                break
            case 'name':
                filtered.sort((a, b) => 
                    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                )
                break
            case 'recent':
                // Assuming newer users have higher IDs
                filtered.sort((a, b) => b.userId - a.userId)
                break
        }

        return filtered
    }, [suggestions, searchQuery, sortBy])

    // Paginated suggestions
    const displayedSuggestions = filteredSuggestions.slice(0, limit)
    const hasMore = filteredSuggestions.length > limit
    const totalCount = filteredSuggestions.length

    // Handlers
    const handleConnect = async (userId: number) => {
        setConnectingUserId(userId)
        try {
            await sendConnectionRequest.mutateAsync({ receiverId: userId })
        } finally {
            setConnectingUserId(null)
        }
    }

    const handleViewProfile = (userId: number) => {
        router.push(`/student/profile/${userId}` as any)
    }

    const handleLoadMore = () => {
        setLimit(prev => prev + 12)
    }

    const handleRefresh = () => {
        refetch()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Find Study Partners
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Recommended
                        </span>
                    </div>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        We've analyzed your courses, learning style, and availability to find your best academic matches.
                    </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'list'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <List className="h-4 w-4" />
                        List
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search by name or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-4 w-4" />}
                    />
                </div>

                {/* Subject Filter */}
                <div className="relative">
                    <select
                        value={selectedSubjectId || ''}
                        onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                        className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Subjects</option>
                        {subjects?.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="appearance-none bg-transparent text-sm font-medium text-primary-600 dark:text-primary-400 focus:outline-none cursor-pointer"
                    >
                        <option value="compatibility">Highest Compatibility</option>
                        <option value="name">Name</option>
                        <option value="recent">Recently Joined</option>
                    </select>
                </div>

                {/* Refresh */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    loading={isFetching}
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                }`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <StudyPartnerCardSkeleton key={i} />
                    ))}
                </div>
            ) : displayedSuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No matches found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        {searchQuery 
                            ? "Try adjusting your search or filters to find more study partners."
                            : "Complete your profile to get personalized match suggestions."}
                    </p>
                </div>
            ) : (
                <>
                    {/* Results grid */}
                    <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                            : 'grid-cols-1'
                    }`}>
                        {displayedSuggestions.map((partner) => (
                            <StudyPartnerCard
                                key={partner.userId}
                                partner={partner}
                                onConnect={handleConnect}
                                onViewProfile={handleViewProfile}
                                isConnecting={connectingUserId === partner.userId}
                            />
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {displayedSuggestions.length} of {totalCount} potential matches
                        </p>
                        {hasMore && (
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                            >
                                Load More Suggestions
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </>
            )}

            {/* Pro Tip */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                        Pro Tip: Personalize your requests
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Matches are 40% more likely to accept a connection request if you include a brief message about which subject you'd like to collaborate on.
                    </p>
                </div>
                <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => router.push('/student/profile')}
                >
                    Update My Preferences
                </Button>
            </div>
        </div>
    )
}
