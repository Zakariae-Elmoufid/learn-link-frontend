'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { useTasks, useCreateTask, useCompleteTask, useDeleteTask, useUpdateTask } from '@/hookes/usePlanner'
import { TaskRequest, TaskResponse } from '@/lib/api/types'

type ViewType = 'month' | 'week' | 'day'

interface TaskDetailModalProps {
    isOpen: boolean
    task: any
    onClose: () => void
    onComplete: (id: number) => void
    onDelete: (id: number) => void
    onUpdate: (id: number, data: TaskRequest) => Promise<void>
    isLoading: boolean
}

function TaskDetailModal({ isOpen, task, onClose, onComplete, onDelete, onUpdate, isLoading }: TaskDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<TaskRequest | null>(null)

    if (!isOpen || !task) return null

    const getCategoryColor = (subject: string) => {
        const colors: any = {
            'Data Structures': 'bg-blue-100 text-blue-800',
            'ML Assignment': 'bg-red-100 text-red-800',
            'Lecture': 'bg-blue-100 text-blue-800',
            'Assignment': 'bg-red-100 text-red-800',
            'Exam': 'bg-red-100 text-red-800',
            'Other': 'bg-gray-100 text-gray-800',
        }
        return colors[subject] || 'bg-gray-100 text-gray-800'
    }

    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleSaveUpdate = async () => {
        if (!formData) return
        try {
            await onUpdate(task.id, formData)
            setIsEditing(false)
            toast.success('Task updated successfully')
        } catch (error) {
            toast.error('Failed to update task')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                    <button
                        onClick={() => onDelete(task.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                        title="Delete task"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                {!isEditing ? (
                    <>
                        <div className="space-y-4 mb-6">
                            {task.subject && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Category</label>
                                    <p className={`text-sm font-medium px-3 py-1 rounded inline-block ${getCategoryColor(task.subject)}`}>
                                        {task.subject}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">Start</label>
                                <p className="text-sm text-gray-900">{formatTime(task.startTime)}</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">End</label>
                                <p className="text-sm text-gray-900">{formatTime(task.endTime)}</p>
                            </div>

                            {task.description && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Description</label>
                                    <p className="text-sm text-gray-900">{task.description}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                                <p className={`text-sm font-medium ${task.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {task.completed ? '✓ COMPLETED' : '● Pending'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {!task.completed && (
                                <button
                                    onClick={() => {
                                        onComplete(task.id)
                                        onClose()
                                    }}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    ✓ Mark Completed
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setFormData({
                                        title: task.title,
                                        description: task.description,
                                        startTime: task.startTime,
                                        endTime: task.endTime,
                                        priority: task.priority,
                                        subject: task.subject,
                                    })
                                    setIsEditing(true)
                                }}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <form className="space-y-4 mb-6" onSubmit={(e) => {
                            e.preventDefault()
                            handleSaveUpdate()
                        }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={formData?.title || ''}
                                    onChange={(e) => setFormData({ ...formData!, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData?.description || ''}
                                    onChange={(e) => setFormData({ ...formData!, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData?.startTime?.slice(0, 16) || ''}
                                    onChange={(e) => setFormData({ ...formData!, startTime: new Date(e.target.value).toISOString() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData?.endTime?.slice(0, 16) || ''}
                                    onChange={(e) => setFormData({ ...formData!, endTime: new Date(e.target.value).toISOString() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData?.subject || 'Other'}
                                    onChange={(e) => setFormData({ ...formData!, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Other</option>
                                    <option>Data Structures</option>
                                    <option>ML Assignment</option>
                                    <option>Lecture</option>
                                    <option>Assignment</option>
                                    <option>Exam</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: TaskRequest) => Promise<void>
    isLoading: boolean
}

function CreateTaskModal({ isOpen, onClose, onSubmit, isLoading }: CreateTaskModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        category: 'Other',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
            toast.error('Please fill in all required fields')
            return
        }

        const startDateTime = `${formData.startDate}T${formData.startTime}`
        const endDateTime = `${formData.endDate}T${formData.endTime}`

        const taskData: TaskRequest = {
            title: formData.title,
            description: formData.description || undefined,
            startTime: startDateTime,
            endTime: endDateTime,
            priority: 'MEDIUM',
            subject: formData.category,
        }

        try {
            await onSubmit(taskData)
            setFormData({
                title: '',
                description: '',
                startDate: '',
                startTime: '',
                endDate: '',
                endTime: '',
                category: 'Other',
            })
            onClose()
        } catch (error) {
            // Error handled by parent
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Event</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Event title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Event description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Other</option>
                            <option>Data Structures</option>
                            <option>ML Assignment</option>
                            <option>Lecture</option>
                            <option>Assignment</option>
                            <option>Exam</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
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

function MonthView({ tasks, currentDate, onDateChange, onTaskClick }: any) {
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const maxDays = daysInMonth(currentDate)
    const startDay = firstDayOfMonth(currentDate)
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
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
                                    onClick={() => onTaskClick(task)}
                                    className={`text-xs px-2 py-1 rounded truncate cursor-pointer hover:shadow-md transition-shadow ${getCategoryColor(task.subject || 'Other')}`}
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

function WeekView({ tasks, currentDate, onDateChange, onConfirm, onCancel, onTaskClick }: any) {
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
                                        onClick={() => onTaskClick(task)}
                                        className={`p-3 rounded-lg text-sm cursor-pointer hover:shadow-md transition-shadow ${getCategoryColor(task.subject || 'Other')}`}
                                    >
                                        <p className="font-semibold text-sm">{task.startTime.split('T')[1]?.slice(0, 5)}</p>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-xs opacity-75 mt-1">
                                            {task.completed ? '✓ COMPLETED' : '● Pending'}
                                        </p>
                                        {!task.completed && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onConfirm(task.id)
                                                    }}
                                                    className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors font-medium"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onCancel(task.id)
                                                    }}
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

function DayView({ tasks, currentDate, onConfirm, onCancel, onTaskClick }: any) {
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
                            <div key={task.id} onClick={() => onTaskClick(task)} className={`p-6 rounded-lg cursor-pointer hover:shadow-lg transition-shadow ${getCategoryColor(task.subject || 'Other')}`}>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-lg font-bold">{time}</p>
                                    </div>
                                    {!task.completed && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onConfirm(task.id)
                                                }}
                                                className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors font-medium"
                                            >
                                                Complete
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onCancel(task.id)
                                                }}
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
    const updateTaskMutation = useUpdateTask()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any>(null)
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

    const handleTaskClick = (task: any) => {
        setSelectedTask(task)
        setIsDetailModalOpen(true)
    }

    const handleCompleteFromDetail = async (taskId: number) => {
        try {
            await completeTaskMutation.mutateAsync(taskId)
            setIsDetailModalOpen(false)
            setSelectedTask(null)
            toast.success('Event marked as completed!')
        } catch (error) {
            toast.error('Failed to mark event as completed')
        }
    }

    const handleDeleteFromDetail = async (taskId: number) => {
        try {
            await deleteTaskMutation.mutateAsync(taskId)
            setIsDetailModalOpen(false)
            setSelectedTask(null)
            toast.success('Event deleted')
        } catch (error) {
            toast.error('Failed to delete event')
        }
    }

    const handleUpdateTask = async (taskId: number, data: TaskRequest) => {
        try {
            await updateTaskMutation.mutateAsync({ taskId, data })
            toast.success('Event updated successfully')
        } catch (error) {
            toast.error('Failed to update event')
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
                                    className={`px-4 py-1 rounded font-medium transition-colors text-sm ${view === v
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
                            <MonthView
                                tasks={allTasks}
                                currentDate={currentDate}
                                onDateChange={setCurrentDate}
                                onTaskClick={handleTaskClick}
                            />
                        )}
                        {view === 'week' && (
                            <WeekView
                                tasks={allTasks}
                                currentDate={currentDate}
                                onDateChange={setCurrentDate}
                                onConfirm={handleConfirmTask}
                                onCancel={handleCancelTask}
                                onTaskClick={handleTaskClick}
                            />
                        )}
                        {view === 'day' && (
                            <DayView
                                tasks={allTasks}
                                currentDate={currentDate}
                                onConfirm={handleConfirmTask}
                                onCancel={handleCancelTask}
                                onTaskClick={handleTaskClick}
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

            {/* Task Detail Modal */}
            <TaskDetailModal
                isOpen={isDetailModalOpen}
                task={selectedTask}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedTask(null)
                }}
                onComplete={handleCompleteFromDetail}
                onDelete={handleDeleteFromDetail}
                onUpdate={handleUpdateTask}
                isLoading={completeTaskMutation.isPending || deleteTaskMutation.isPending || updateTaskMutation.isPending}
            />
        </div>
    )
}
