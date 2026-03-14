'use client'

import { useState, useMemo } from 'react'
import {
    useTasks,
    useCreateTask,
    useCompleteTask,
    useDeleteTask,
} from '@/hookes'
import { TaskRequest, TaskPriority } from '@/lib/api/types'
import toast from 'react-hot-toast'

type ViewType = 'month' | 'week' | 'day'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: TaskRequest) => Promise<void>
    isLoading: boolean
}

function CreateTaskModal({ isOpen, onClose, onSubmit, isLoading }: CreateTaskModalProps) {
    const [formData, setFormData] = useState<TaskRequest>({
        title: '',
        description: '',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
        priority: 'MEDIUM',
        subject: '',
        tags: [],
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await onSubmit(formData)
            setFormData({
                title: '',
                description: '',
                startTime: new Date().toISOString().slice(0, 16),
                endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
                priority: 'MEDIUM',
                subject: '',
                tags: [],
            })
            onClose()
        } catch (error) {
            // Error handled by mutation
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-900">Add New Event</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>
                <p className="text-gray-600 text-sm mb-6">Schedule a new event in your planner.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            minLength={3}
                            maxLength={255}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g. Algorithms Lecture"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Description
                        </label>
                        <textarea
                            maxLength={500}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Location or notes..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startTime.split('T')[0]}
                                    onChange={(e) => {
                                        const time = formData.startTime.split('T')[1] || '09:00'
                                        setFormData({ ...formData, startTime: `${e.target.value}T${time}` })
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.startTime.split('T')[1] || '09:00'}
                                    onChange={(e) => {
                                        const date = formData.startTime.split('T')[0]
                                        setFormData({ ...formData, startTime: `${date}T${e.target.value}` })
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endTime.split('T')[0]}
                                    onChange={(e) => {
                                        const time = formData.endTime.split('T')[1] || '10:00'
                                        setFormData({ ...formData, endTime: `${e.target.value}T${time}` })
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.endTime.split('T')[1] || '10:00'}
                                    onChange={(e) => {
                                        const date = formData.endTime.split('T')[0]
                                        setFormData({ ...formData, endTime: `${date}T${e.target.value}` })
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Category
                        </label>
                        <select
                            value={formData.subject || 'Lecture'}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="Lecture">Lecture</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Study Group">Study Group</option>
                            <option value="Exam">Exam</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium rounded-md text-sm transition-colors"
                        >
                            {isLoading ? 'Adding...' : 'Add Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function MonthView({ tasks, currentDate, onDateChange }: any) {
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const maxDays = daysInMonth(currentDate)
    const startDay = firstDayOfMonth(currentDate)

    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const getTasksForDate = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        return tasks.filter((task: any) => {
            const taskDate = new Date(task.startTime)
            return taskDate.toDateString() === date.toDateString()
        }).slice(0, 3)
    }

    const getCategoryColor = (subject: string) => {
        const colors: any = {
            'Data Structures': 'bg-blue-100 text-blue-800',
            'Study Group': 'bg-green-100 text-green-800',
            'ML Assignment': 'bg-red-100 text-red-800',
            'Lecture': 'bg-blue-100 text-blue-800',
            'Assignment': 'bg-red-100 text-red-800',
            'Exam': 'bg-red-100 text-red-800',
            'Other': 'bg-gray-100 text-gray-800',
        }
        return colors[subject] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">{monthName}</h2>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {dayLabels.map((day) => (
                    <div key={day} className="bg-white p-4 text-center">
                        <p className="text-xs font-semibold text-blue-600">{day}</p>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-50 p-4 min-h-28" />
                ))}

                {Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => (
                    <div
                        key={day}
                        className="bg-white p-4 min-h-28 border-r border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <p className="text-sm font-semibold text-gray-900 mb-2">{day}</p>
                        <div className="space-y-1">
                            {getTasksForDate(day).map((task: any) => (
                                <div
                                    key={task.id}
                                    className={`text-xs px-2 py-1 rounded truncate ${getCategoryColor(task.subject || 'Other')}`}
                                >
                                    {task.title}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function WeekView({ tasks, currentDate, onDateChange, onConfirm, onCancel }: any) {
    const getWeekStart = (date: Date) => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day
        return new Date(d.setDate(diff))
    }

    const weekStart = getWeekStart(currentDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        return date
    })

    const getCategoryColor = (subject: string) => {
        const colors: any = {
            'Data Structures': 'bg-blue-100 text-blue-700 border-l-4 border-blue-400',
            'Study Group': 'bg-green-100 text-green-700 border-l-4 border-green-400',
            'ML Assignment': 'bg-red-100 text-red-700 border-l-4 border-red-400',
            'Lecture': 'bg-blue-100 text-blue-700 border-l-4 border-blue-400',
            'Assignment': 'bg-red-100 text-red-700 border-l-4 border-red-400',
            'Exam': 'bg-red-100 text-red-700 border-l-4 border-red-400',
            'Other': 'bg-purple-100 text-purple-700 border-l-4 border-purple-400',
        }
        return colors[subject] || 'bg-gray-100 text-gray-800 border-l-4 border-gray-400'
    }

    const getTasksForDate = (date: Date) => {
        return tasks.filter((task: any) => {
            const taskDate = new Date(task.startTime)
            return taskDate.toDateString() === date.toDateString()
        })
    }

    const formatWeekRange = () => {
        const startMonth = weekStart.toLocaleString('default', { month: 'short' })
        const endMonth = weekEnd.toLocaleString('default', { month: 'short' })
        return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">{formatWeekRange()}</h2>

            <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-4">
                    {days.map((date, idx) => (
                        <div key={idx} className="min-w-max sm:min-w-0">
                            <div className="text-center mb-4">
                                <p className="text-xs font-semibold text-blue-600">{dayLabels[idx]}</p>
                                <p className={`text-2xl font-bold ${date.getDate() === 14 ? 'text-blue-600 bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
                                    {date.getDate()}
                                </p>
                            </div>

                            <div className="space-y-3 min-h-96">
                                {getTasksForDate(date).map((task: any) => (
                                    <div
                                        key={task.id}
                                        className={`p-3 rounded-lg text-sm ${getCategoryColor(task.subject || 'Other')}`}
                                    >
                                        <p className="font-semibold text-sm">{task.startTime.split('T')[1]?.slice(0, 5)}</p>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-xs opacity-75 mt-1">
                                            {task.completed ? '✓ COMPLETED' : '● Pending'}
                                        </p>
                                        {!task.completed && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => onConfirm(task.id)}
                                                    className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors font-medium"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => onCancel(task.id)}
                                                    className="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function DayView({ tasks, currentDate, onConfirm, onCancel }: any) {
    const dayName = currentDate.toLocaleString('default', { weekday: 'long' })
    const fullDate = `${dayName}, ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getDate()}`

    const dayTasks = tasks
        .filter((task: any) => {
            const taskDate = new Date(task.startTime)
            return taskDate.toDateString() === currentDate.toDateString()
        })
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    const getCategoryColor = (subject: string) => {
        const colors: any = {
            'Data Structures': 'bg-blue-100 text-blue-900',
            'Study Group': 'bg-green-100 text-green-900',
            'ML Assignment': 'bg-red-100 text-red-900',
            'Lecture': 'bg-blue-100 text-blue-900',
            'Assignment': 'bg-red-100 text-red-900',
            'Exam': 'bg-red-100 text-red-900',
            'Other': 'bg-purple-100 text-purple-900',
        }
        return colors[subject] || 'bg-gray-100 text-gray-900'
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">{fullDate}</h2>

            <div className="space-y-4">
                {dayTasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No events scheduled for this day</p>
                ) : (
                    dayTasks.map((task: any) => {
                        const time = task.startTime.split('T')[1]?.slice(0, 5)
                        return (
                            <div key={task.id} className={`p-6 rounded-lg ${getCategoryColor(task.subject || 'Other')}`}>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-lg font-bold">{time}</p>
                                    </div>
                                    {!task.completed && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onConfirm(task.id)}
                                                className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors font-medium"
                                            >
                                                Complete
                                            </button>
                                            <button
                                                onClick={() => onCancel(task.id)}
                                                className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm opacity-75 mt-1">{task.description}</p>
                                    )}
                                    <p className="text-xs opacity-75 mt-2">
                                        {task.completed ? '✓ COMPLETED' : '● Pending'}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default function PlannerPage() {
    const { data: allTasks = [], isLoading } = useTasks()
    const createTaskMutation = useCreateTask()
    const completeTaskMutation = useCompleteTask()
    const deleteTaskMutation = useDeleteTask()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [view, setView] = useState<ViewType>('month')
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 14)) // March 14, 2026

    const handleCreateTask = async (data: TaskRequest) => {
        try {
            await createTaskMutation.mutateAsync(data)
            toast.success('Event created successfully')
        } catch (error) {
            toast.error('Failed to create event')
        }
    }

    const handleConfirmTask = async (taskId: number) => {
        try {
            await completeTaskMutation.mutateAsync(taskId)
            toast.success('Event marked as completed!')
        } catch (error) {
            toast.error('Failed to mark event as completed')
        }
    }

    const handleCancelTask = async (taskId: number) => {
        try {
            await deleteTaskMutation.mutateAsync(taskId)
            toast.success('Event cancelled')
        } catch (error) {
            toast.error('Failed to cancel event')
        }
    }

    const handlePrevious = () => {
        const newDate = new Date(currentDate)
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() - 1)
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() - 7)
        } else {
            newDate.setDate(newDate.getDate() - 1)
        }
        setCurrentDate(newDate)
    }

    const handleNext = () => {
        const newDate = new Date(currentDate)
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + 1)
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + 7)
        } else {
            newDate.setDate(newDate.getDate() + 1)
        }
        setCurrentDate(newDate)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Student Planner</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                            {(['month', 'week', 'day'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-4 py-1 rounded font-medium transition-colors text-sm ${
                                        view === v
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <span>+</span> Add Event
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation and View */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handlePrevious}
                        className="text-gray-600 hover:text-gray-900 text-2xl"
                    >
                        ‹
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={handleNext}
                        className="text-gray-600 hover:text-gray-900 text-2xl"
                    >
                        ›
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <p className="text-gray-500">Loading events...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        {view === 'month' && (
                            <MonthView tasks={allTasks} currentDate={currentDate} onDateChange={setCurrentDate} />
                        )}
                        {view === 'week' && (
                            <WeekView 
                                tasks={allTasks} 
                                currentDate={currentDate} 
                                onDateChange={setCurrentDate}
                                onConfirm={handleConfirmTask}
                                onCancel={handleCancelTask}
                            />
                        )}
                        {view === 'day' && (
                            <DayView 
                                tasks={allTasks} 
                                currentDate={currentDate}
                                onConfirm={handleConfirmTask}
                                onCancel={handleCancelTask}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
                isLoading={createTaskMutation.isPending}
            />
        </div>
    )
}
