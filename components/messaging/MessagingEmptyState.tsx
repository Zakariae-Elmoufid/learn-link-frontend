'use client'

import { MessageCircle, Users, Grid } from 'lucide-react'
import { Button } from '../ui'

interface MessagingEmptyStateProps {
    onFindPartners?: () => void
    onExploreGroups?: () => void
}

export function MessagingEmptyState({ onFindPartners, onExploreGroups }: MessagingEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-800/50 p-8">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
                <MessageCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Your Conversations
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8">
                Select a chat from the list on the left to view messages, share resources, and collaborate with your study partners.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={onFindPartners}
                    className="flex items-center gap-2"
                >
                    <Users className="h-4 w-4" />
                    Find Partners
                </Button>
                <Button
                    variant="outline"
                    onClick={onExploreGroups}
                    className="flex items-center gap-2"
                >
                    <Grid className="h-4 w-4" />
                    Explore Groups
                </Button>
            </div>
        </div>
    )
}
