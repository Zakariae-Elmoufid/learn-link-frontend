'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    useDiscoverGroups,
    useSearchGroups,
    useGroupsBySubject,
    useMyGroups,
    useSubjects,
    useJoinGroup,
    useRequestJoinGroup,
    useCreateGroup,
    useUploadGroupImage,
} from '../../../hookes'
import { GroupCard, GroupCardSkeleton, CreateGroupModal } from '../../../components/groups'
import { Button, Input } from '../../../components/ui'
import {
    Search,
    Plus,
    LayoutGrid,
    List,
    ChevronDown,
    Users,
    Sparkles,
    Clock,
    BookOpen,
    Filter,
} from 'lucide-react'
import { StudyGroupResponse } from '../../../lib/api/types'

type TabType = 'all' | 'recommended' | 'recent' | 'by-subject' | 'my-groups'
type SortOption = 'newest' | 'oldest' | 'most-members' | 'name'
type ViewMode = 'grid' | 'list'

export default function GroupsPage() {
    const router = useRouter()

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [page, setPage] = useState(0)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null)
    const [showSubjectFilter, setShowSubjectFilter] = useState(false)
    const [showSortDropdown, setShowSortDropdown] = useState(false)

    // API page size
    const pageSize = 12

    // Data fetching
    const { data: subjects } = useSubjects()
    const { data: discoverData, isLoading: isLoadingDiscover } = useDiscoverGroups(page, pageSize)
    const { data: searchResults, isLoading: isSearching } = useSearchGroups(debouncedSearch, page, pageSize)
    const { data: subjectGroups, isLoading: isLoadingSubject } = useGroupsBySubject(selectedSubjectId)
    const { data: myGroups, isLoading: isLoadingMyGroups } = useMyGroups()

    // Mutations
    const joinGroup = useJoinGroup()
    const requestJoinGroup = useRequestJoinGroup()
    const createGroup = useCreateGroup()
    const uploadGroupImage = useUploadGroupImage()

    // Debounce search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPage(0)
        // Simple debounce
        setTimeout(() => setDebouncedSearch(value), 300)
    }

    // Determine which groups to display based on active tab and filters
    const displayGroups = useMemo((): StudyGroupResponse[] => {
        if (debouncedSearch) {
            return searchResults?.content || []
        }

        switch (activeTab) {
            case 'all':
                return discoverData?.content || []
            case 'recommended':
                // For recommended, we'll show groups sorted by potential match
                // In a real app, this would be a separate API endpoint
                return discoverData?.content || []
            case 'recent':
                // Show recently active groups (sorted by newest)
                return discoverData?.content || []
            case 'by-subject':
                if (selectedSubjectId) {
                    return subjectGroups || []
                }
                return discoverData?.content || []
            case 'my-groups':
                return myGroups || []
            default:
                return []
        }
    }, [activeTab, discoverData, searchResults, subjectGroups, myGroups, debouncedSearch, selectedSubjectId])

    // Sort groups
    const sortedGroups = useMemo(() => {
        const groups = [...displayGroups]
        switch (sortBy) {
            case 'newest':
                return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            case 'oldest':
                return groups.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            case 'most-members':
                return groups.sort((a, b) => b.currentMemberCount - a.currentMemberCount)
            case 'name':
                return groups.sort((a, b) => a.name.localeCompare(b.name))
            default:
                return groups
        }
    }, [displayGroups, sortBy])

    // Loading state
    const isLoading = isLoadingDiscover || isSearching || isLoadingSubject || isLoadingMyGroups

    // Pagination info
    const totalPages = debouncedSearch
        ? searchResults?.totalPages || 0
        : discoverData?.totalPages || 0
    const totalElements = debouncedSearch
        ? searchResults?.totalElements || 0
        : discoverData?.totalElements || 0

    // Handlers
    const handleJoin = async (groupId: number) => {
        setJoiningGroupId(groupId)
        try {
            await joinGroup.mutateAsync(groupId)
        } finally {
            setJoiningGroupId(null)
        }
    }

    const handleRequestJoin = async (groupId: number) => {
        setJoiningGroupId(groupId)
        try {
            await requestJoinGroup.mutateAsync(groupId)
        } finally {
            setJoiningGroupId(null)
        }
    }

    const handleViewDetails = (groupId: number) => {
        router.push(`/student/groups/${groupId}` as any)
    }

    const handleCreateGroup = async (data: any, imageFile?: File) => {
        try {
            const createdGroup = await createGroup.mutateAsync(data)
            // Upload image if provided
            if (imageFile && createdGroup?.id) {
                await uploadGroupImage.mutateAsync({ groupId: createdGroup.id, file: imageFile })
            }
            setShowCreateModal(false)
        } catch (error) {
            // Error is handled by the hook
        }
    }

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab)
        setPage(0)
        if (tab !== 'by-subject') {
            setSelectedSubjectId(null)
        }
    }

    const tabs = [
        { id: 'all' as TabType, label: 'All Groups', icon: <LayoutGrid className="h-4 w-4" /> },
        { id: 'recommended' as TabType, label: 'Recommended', icon: <Sparkles className="h-4 w-4" /> },
        { id: 'recent' as TabType, label: 'Recently Active', icon: <Clock className="h-4 w-4" /> },
        { id: 'by-subject' as TabType, label: 'By Subject', icon: <BookOpen className="h-4 w-4" /> },
    ]

    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'most-members', label: 'Most Members' },
        { value: 'name', label: 'Name (A-Z)' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Discover Groups
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Find and join communities tailored to your learning goals.
                    </p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Create Group
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Input
                        icon={<Search className="h-4 w-4" />}
                        placeholder="Search groups by name or keyword..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                {/* Subject Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowSubjectFilter(!showSubjectFilter)}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 w-full sm:w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="truncate">
                            {selectedSubjectId 
                                ? subjects?.find(s => s.id === selectedSubjectId)?.name || 'Subject'
                                : 'All Subjects'
                            }
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                    </button>
                    
                    {showSubjectFilter && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowSubjectFilter(false)} 
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setSelectedSubjectId(null)
                                        setShowSubjectFilter(false)
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                        !selectedSubjectId ? 'text-primary-600 font-medium' : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    All Subjects
                                </button>
                                {subjects?.map((subject) => (
                                    <button
                                        key={subject.id}
                                        onClick={() => {
                                            setSelectedSubjectId(subject.id)
                                            setActiveTab('by-subject')
                                            setShowSubjectFilter(false)
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                            selectedSubjectId === subject.id 
                                                ? 'text-primary-600 font-medium' 
                                                : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {subject.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 w-full sm:w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                    </button>
                    
                    {showSortDropdown && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowSortDropdown(false)} 
                            />
                            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value as SortOption)
                                            setShowSortDropdown(false)
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                            sortBy === option.value 
                                                ? 'text-primary-600 font-medium' 
                                                : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs and Online Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 overflow-x-auto pb-px">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Online Indicator */}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>252 students online now</span>
                </div>
            </div>

            {/* My Groups Tab Link */}
            {activeTab !== 'my-groups' && (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleTabChange('my-groups')}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                        View My Groups →
                    </button>
                </div>
            )}

            {/* Groups Grid */}
            {isLoading ? (
                <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                }`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <GroupCardSkeleton key={i} />
                    ))}
                </div>
            ) : sortedGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        No groups found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                        {debouncedSearch 
                            ? `No groups match "${debouncedSearch}". Try a different search term.`
                            : activeTab === 'my-groups'
                            ? "You haven't joined any groups yet. Discover groups to join!"
                            : "No groups available. Be the first to create one!"}
                    </p>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4" />
                        Create a Group
                    </Button>
                </div>
            ) : (
                <>
                    <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                            : 'grid-cols-1'
                    }`}>
                        {sortedGroups.map((group) => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                onJoin={handleJoin}
                                onRequestJoin={handleRequestJoin}
                                onViewDetails={handleViewDetails}
                                isJoining={joiningGroupId === group.id}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Previous
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum: number
                                    if (totalPages <= 5) {
                                        pageNum = i
                                    } else if (page < 3) {
                                        pageNum = i
                                    } else if (page > totalPages - 4) {
                                        pageNum = totalPages - 5 + i
                                    } else {
                                        pageNum = page - 2 + i
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                                                page === pageNum
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    )
                                })}
                                
                                {totalPages > 5 && page < totalPages - 3 && (
                                    <>
                                        <span className="px-2 text-slate-400">...</span>
                                        <button
                                            onClick={() => setPage(totalPages - 1)}
                                            className="h-9 w-9 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateGroup}
                subjects={subjects}
                isLoading={createGroup.isPending || uploadGroupImage.isPending}
            />
        </div>
    )
}
