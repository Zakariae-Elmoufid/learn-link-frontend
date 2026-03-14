'use client'

import { useState } from 'react'
import { useTasks, useCreateTask, useCompleteTask, useDeleteTask, useUpdateTask } from '@/hookes'
import { TaskRequest, TaskPriority, TaskStatus } from '@/lib/api/types'
import toast from 'react-hot-toast'

const STATUS_COLUMNS: { status: TaskStatus; label: string; icon: string; color: string }[] = [
    { status: 'PENDING', label: 'To Do', icon: '●', color: 'gray' },
    { status: 'IN_PROGRESS', label: 'In Progress', icon: '●', color: 'blue' },
    { status: 'COMPLETED', label: 'Done', icon: '●', color: 'green' },
]

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
            // Error is already handled by mutation
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            minLength={3}
                            maxLength={255}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Complete algebra homework"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject
                            </label>
                            <input
                                type="text"
                                maxLength={100}
                                value={formData.subject || ''}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Math"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority *
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        priority: e.target.value as TaskPriority,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            maxLength={2000}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional task details"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
                        >
                            {isLoading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

interface TaskCardProps {
    task: any
    onComplete: (id: number) => void
    onDelete: (id: number) => void
    isDeleteing: boolean
}

function TaskCard({ task, onComplete, onDelete, isDeleteing }: TaskCardProps) {
    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800'
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800'
            case 'LOW':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getTimeLabel = (startTime: string, endTime: string) => {
        const start = new Date(startTime)
        const end = new Date(endTime)
        const today = new Date()

        if (start.toDateString() === today.toDateString()) {
            return 'Today'
        }

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (start.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow'
        }

        return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-medium text-gray-900 flex-1 leading-snug text-sm line-clamp-2">
                    {task.title}
                </h3>
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        onDelete(task.id)
                    }}
                    disabled={isDeleteing}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                    ✕
                </button>
            </div>

            {task.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
                {task.subject && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {task.subject}
                    </span>
                )}
                <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                    🕐 {getTimeLabel(task.startTime, task.endTime)}
                </span>
                {task.status !== 'COMPLETED' && (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            onComplete(task.id)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Mark Done
                    </button>
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

    const handleCreateTask = async (data: TaskRequest) => {
        try {
            await createTaskMutation.mutateAsync(data)
            toast.success('Task created successfully')
        } catch (error) {
            toast.error('Failed to create task')
        }
    }

    const handleCompleteTask = async (taskId: number) => {
        try {
            await completeTaskMutation.mutateAsync(taskId)
            toast.success('Task marked as done')
        } catch (error) {
            toast.error('Failed to mark task as done')
        }
    }

    const handleDeleteTask = async (taskId: number) => {
        try {
            await deleteTaskMutation.mutateAsync(taskId)
            toast.success('Task deleted')
        } catch (error) {
            toast.error('Failed to delete task')
        }
    }

    // Group tasks by status
    const tasksByStatus = {
        PENDING: allTasks.filter((t) => t.status === 'PENDING'),
        IN_PROGRESS: allTasks.filter((t) => t.status === 'IN_PROGRESS'),
        COMPLETED: allTasks.filter((t) => t.status === 'COMPLETED'),
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Planner Board</h1>
                        <p className="text-gray-600 text-sm mt-1">Drag and drop tasks to update progress</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <span>+</span> Create Task
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <p className="text-gray-500 text-lg">Loading tasks...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STATUS_COLUMNS.map((column) => {
                            const columnTasks = tasksByStatus[column.status as keyof typeof tasksByStatus]
                            const Icon = column.icon

                            return (
                                <div
                                    key={column.status}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-96"
                                >
                                    {/* Column Header */}
                                    <div className="mb-4 pb-4 border-b border-gray-300">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xl text-${column.color}-500`}
                                                style={{
                                                    color:
                                                        column.color === 'gray'
                                                            ? '#9CA3AF'
                                                            : column.color === 'blue'
                                                              ? '#3B82F6'
                                                              : '#10B981',
                                                }}
                                            >
                                                {Icon}
                                            </span>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {column.label}
                                            </h2>
                                            <span className="ml-auto bg-gray-300 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                {columnTasks.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Task Cards */}
                                    <div className="space-y-3">
                                        {columnTasks.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 text-sm">No tasks yet</p>
                                            </div>
                                        ) : (
                                            columnTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onComplete={handleCompleteTask}
                                                    onDelete={handleDeleteTask}
                                                    isDeleteing={deleteTaskMutation.isPending}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
                isLoading={createTaskMutation.isPending}
            />
        </div>
    )
}
