'use client'
import {cn} from "../../lib/utils";
import { Loader2 } from 'lucide-react'
import * as React from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            outline: 'btn-outline',
            ghost: 'btn-ghost',
            destructive: 'btn-destructive',
        }
        const sizes = {
            sm: 'btn-sm',
            md: '',
            lg: 'btn-lg',
            icon: 'h-9 w-9 p-0 rounded-lg',
        }

        return (
            <button
                ref={ref}
        className={cn('btn', variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
    >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
        </button>
    )
    },
)
Button.displayName = 'Button'

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            </label>
    )}
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    {icon}
                    </div>
            )}
        <input
            ref={ref}
        id={inputId}
        className={cn('input', icon && 'pl-9', error && 'border-red-400 focus:ring-red-400', className)}
        {...props}
        />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        )
        },
    )
        Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

        interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
            label?: string
            error?: string
        }

        export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
            ({ className, label, error, id, ...props }, ref) => {
                const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
                return (
                    <div className="flex flex-col gap-1.5">
                        {label && (
                            <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                    </label>
            )}
                <textarea
                    ref={ref}
                id={inputId}
                className={cn('textarea', error && 'border-red-400 focus:ring-red-400', className)}
                {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                )
                },
            )
                Textarea.displayName = 'Textarea'

// ─── Card ─────────────────────────────────────────────────────────────────────

                interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
                    hover?: boolean
                    padding?: 'none' | 'sm' | 'md' | 'lg'
                }

                export const Card = React.forwardRef<HTMLDivElement, CardProps>(
                    ({ className, hover, padding = 'md', children, ...props }, ref) => {
                        const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
                        return (
                            <div
                                ref={ref}
                        className={cn(hover ? 'card-hover' : 'card', paddings[padding], className)}
                        {...props}
                    >
                        {children}
                        </div>
                    )
                    },
                )
                Card.displayName = 'Card'

// ─── Avatar ───────────────────────────────────────────────────────────────────

                interface AvatarProps {
                    src?: string | null
                    name: string
                    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
                    className?: string
                    online?: boolean
                }

                export function Avatar({ src, name, size = 'md', className, online }: AvatarProps) {
                    const sizes = { xs: 'h-6 w-6 text-xs', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' }
                    const dotSizes = { xs: 'h-1.5 w-1.5', sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3', xl: 'h-3.5 w-3.5' }

                    const initials = name
                        .split(' ')
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase() ?? '')
                        .join('')

                    return (
                        <div className={cn('relative inline-flex shrink-0', className)}>
                    {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={src}
                        alt={name}
                        className={cn('rounded-full object-cover ring-2 ring-white dark:ring-gray-800', sizes[size])}
                        />
                    ) : (
                        <div
                            className={cn(
                            'rounded-full ring-2 ring-white dark:ring-gray-800 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold flex items-center justify-center',
                            sizes[size],
                    )}
                    >
                        {initials}
                        </div>
                    )}
                    {online !== undefined && (
                        <span
                            className={cn(
                            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-gray-800',
                            dotSizes[size],
                            online ? 'bg-secondary-500' : 'bg-slate-300',
                    )}
                        />
                    )}
                    </div>
                )
                }

// ─── Badge ────────────────────────────────────────────────────────────────────

                type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'red' | 'gray'

                interface BadgeProps {
                    children: React.ReactNode
                    variant?: BadgeVariant
                    className?: string
                }

                export function Badge({ children, variant = 'gray', className }: BadgeProps) {
                    return (
                        <span className={cn(`badge-${variant}`, className)}>
                    {children}
                    </span>
                )
                }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

                interface SkeletonProps {
                    className?: string
                }

                export function Skeleton({ className }: SkeletonProps) {
                    return <div className={cn('skeleton', className)} />
                }

// ─── Empty State ──────────────────────────────────────────────────────────────

                interface EmptyStateProps {
                    icon?: React.ReactNode
                    title: string
                    description?: string
                    action?: React.ReactNode
                    className?: string
                }

                export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
                    return (
                        <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
                    {icon && <div className="mb-4 text-slate-300 dark:text-slate-600">{icon}</div>}
                        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
                        {description && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>}
                            {action && <div className="mt-4">{action}</div>}
                                </div>
                            )
                            }

// ─── Spinner ──────────────────────────────────────────────────────────────────

                            export function Spinner({ className }: { className?: string }) {
                                return <Loader2 className={cn('h-5 w-5 animate-spin text-primary-600', className)} />
                            }

// ─── Stats Card ───────────────────────────────────────────────────────────────

                            interface StatsCardProps {
                                label: string
                                value: string | number
                                icon?: React.ReactNode
                                trend?: number
                                className?: string
                            }

                            export function StatsCard({ label, value, icon, trend, className }: StatsCardProps) {
                                return (
                                    <Card className={cn('flex items-center gap-4', className)}>
                                {icon && (
                                    <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 p-3 text-primary-600 dark:text-primary-400">
                                        {icon}
                                        </div>
                                )}
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                                {trend !== undefined && (
                                    <p className={cn('text-xs mt-0.5', trend >= 0 ? 'text-secondary-600' : 'text-red-500')}>
                                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
                                </p>
                                )}
                                </div>
                                </Card>
                            )
                            }

// ─── Progress Bar ─────────────────────────────────────────────────────────────

                            interface ProgressProps {
                                value: number
                                max?: number
                                label?: string
                                className?: string
                                color?: 'primary' | 'secondary' | 'accent'
                            }

                            export function Progress({ value, max = 100, label, className, color = 'primary' }: ProgressProps) {
                                const percent = Math.min((value / max) * 100, 100)
                                const colors = {
                                    primary: 'bg-primary-600',
                                    secondary: 'bg-secondary-500',
                                    accent: 'bg-accent-500',
                                }

                                return (
                                    <div className={className}>
                                        {label && (
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>{label}</span>
                                                <span>{value} / {max}</span>
                                </div>
                            )}
                                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-500', colors[color])}
                                style={{ width: `${percent}%` }}
                                />
                                </div>
                                </div>
                            )
                            }

// ─── Divider ──────────────────────────────────────────────────────────────────

                            export function Divider({ className }: { className?: string }) {
                                return <hr className={cn('divider', className)} />
                            }