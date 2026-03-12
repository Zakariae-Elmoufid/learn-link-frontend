'use client'

import { useState, useEffect, useRef } from 'react'
import { UpdateGroupRequest, StudyGroupResponse } from '../../lib/api/types'
import { Button, Input, Textarea } from '../ui'
import { X, Edit, Globe, Lock, Upload, Trash2 } from 'lucide-react'

interface EditGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: UpdateGroupRequest, imageFile?: File) => void
    group: StudyGroupResponse
    isLoading?: boolean
}

export function EditGroupModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    group,
    isLoading 
}: EditGroupModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState<Omit<UpdateGroupRequest, 'coverImageUrl'>>({
        name: group.name,
        description: group.description || '',
        maxMembers: group.maxMembers,
        isPublic: group.isPublic,
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof UpdateGroupRequest, string>>>({})

    // Check if current image is a valid URL
    const isValidCurrentImage = group.coverImageUrl && 
        (group.coverImageUrl.startsWith('http://') || group.coverImageUrl.startsWith('https://'))

    // Reset form when modal opens with group data
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: group.name,
                description: group.description || '',
                maxMembers: group.maxMembers,
                isPublic: group.isPublic,
            })
            setImageFile(null)
            setImagePreview(null)
            setRemoveCurrentImage(false)
            setErrors({})
        }
    }, [isOpen, group])

    // Clean up preview URL on unmount
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    const handleImageSelect = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, coverImageUrl: 'Please select an image file' }))
            return
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, coverImageUrl: 'Image must be less than 5MB' }))
            return
        }
        
        // Revoke previous preview URL
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }
        
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setRemoveCurrentImage(false)
        setErrors(prev => ({ ...prev, coverImageUrl: undefined }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleImageSelect(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleImageSelect(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }
        setImageFile(null)
        setImagePreview(null)
        setRemoveCurrentImage(true)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof UpdateGroupRequest, string>> = {}
        
        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters'
        } else if (formData.name.length > 100) {
            newErrors.name = 'Name must be less than 100 characters'
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters'
        }

        if (formData.maxMembers && (formData.maxMembers < 2 || formData.maxMembers > 50)) {
            newErrors.maxMembers = 'Max members must be between 2 and 50'
        }

        if (formData.maxMembers && formData.maxMembers < group.currentMemberCount) {
            newErrors.maxMembers = `Cannot be less than current members (${group.currentMemberCount})`
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            onSubmit(formData as UpdateGroupRequest, imageFile || undefined)
        }
    }

    // Determine which image to show
    const displayImage = imagePreview || (!removeCurrentImage && isValidCurrentImage ? group.coverImageUrl : null)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Edit className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Edit Group
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Group Name */}
                    <Input
                        label="Group Name"
                        placeholder="e.g., Advanced Mathematics Study Group"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        error={errors.name}
                        required
                    />

                    {/* Description */}
                    <Textarea
                        label="Description"
                        placeholder="Describe what your group is about, what you'll study together, etc."
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        error={errors.description}
                        rows={3}
                    />

                    {/* Max Members */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Maximum Members
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min={group.currentMemberCount}
                                max="50"
                                value={formData.maxMembers || 10}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    maxMembers: Number(e.target.value) 
                                }))}
                                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12 text-center">
                                {formData.maxMembers}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Current members: {group.currentMemberCount}
                        </p>
                        {errors.maxMembers && (
                            <p className="text-xs text-red-500">{errors.maxMembers}</p>
                        )}
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Group Visibility
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                    formData.isPublic
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <Globe className="h-5 w-5" />
                                <span className="font-medium">Public</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                    !formData.isPublic
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <Lock className="h-5 w-5" />
                                <span className="font-medium">Private</span>
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formData.isPublic 
                                ? 'Anyone can find and join this group' 
                                : 'Members need approval to join'}
                        </p>
                    </div>

                    {/* Cover Image Upload */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Cover Image
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {displayImage ? (
                            <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                <img
                                    src={displayImage}
                                    alt="Cover preview"
                                    className="w-full h-40 object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 bg-slate-800/70 hover:bg-slate-800/90 text-white rounded-lg transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            </div>
                        )}
                        {errors.coverImageUrl && (
                            <p className="text-xs text-red-500">{errors.coverImageUrl}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            loading={isLoading}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
