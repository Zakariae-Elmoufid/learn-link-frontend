import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    if (isToday(date)) {
        return formatDistanceToNow(date, { addSuffix: true })
    }
    if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'HH:mm')}`
    }
    return format(date, 'MMM d, yyyy')
}

export function formatDateTime(dateString: string): string {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm')
}

export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength).trim() + '…'
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`
    return num.toString()
}

export function getAvatarUrl(userId: number, username: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

export function getPriorityColor(priority: string): string {
    const map: Record<string, string> = {
        LOW: 'text-secondary-600 bg-secondary-50',
        MEDIUM: 'text-accent-600 bg-accent-50',
        HIGH: 'text-orange-600 bg-orange-50',
        URGENT: 'text-red-600 bg-red-50',
    }
    return map[priority] ?? 'text-gray-600 bg-gray-50'
}

export function getRarityColor(rarity: string): string {
    const map: Record<string, string> = {
        COMMON: 'text-gray-600 border-gray-300',
        RARE: 'text-blue-600 border-blue-300',
        EPIC: 'text-purple-600 border-purple-300',
        LEGENDARY: 'text-accent-600 border-accent-300',
    }
    return map[rarity] ?? 'text-gray-600 border-gray-300'
}

export function getRarityBg(rarity: string): string {
    const map: Record<string, string> = {
        COMMON: 'bg-gray-100',
        RARE: 'bg-blue-100',
        EPIC: 'bg-purple-100',
        LEGENDARY: 'bg-amber-100',
    }
    return map[rarity] ?? 'bg-gray-100'
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) qs.set(key, String(value))
    }
    const str = qs.toString()
    return str ? `?${str}` : ''
}