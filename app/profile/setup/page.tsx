'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useRef } from 'react'
import { Button, Card, Input, Textarea } from '../../../components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateProfile, useSubjects } from '../../../hookes'
import { BookOpen, Camera, X, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const ACADEMIC_LEVELS = [
    'HIGH_SCHOOL',
    'BACHELOR',
    'MASTER',
    'PHD',
    'OTHER'
]

const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
    academicLevel: z.string().min(1, 'Please select your academic level'),
})

type FormValues = z.infer<typeof schema>

export default function FinalizeProfilePage() {
    const router = useRouter()
    const createProfile = useCreateProfile()
    const { data: subjects = [], isLoading: subjectsLoading } = useSubjects()
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
    const [subjectSearch, setSubjectSearch] = useState('')
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    const bioValue = watch('bio') || ''

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const addSubject = (subjectId: number) => {
        if (!selectedSubjects.includes(subjectId)) {
            setSelectedSubjects([...selectedSubjects, subjectId])
        }
        setSubjectSearch('')
        setShowSubjectDropdown(false)
    }

    const removeSubject = (subjectId: number) => {
        setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId))
    }

    const filteredSubjects = subjects.filter(
        subject =>
            !selectedSubjects.includes(subject.id) &&
            subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
    )

    async function onSubmit(data: FormValues) {
        if (selectedSubjects.length === 0) {
            return
        }

        await createProfile.mutateAsync({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio,
                academicLevel: data.academicLevel,
                studentSubjectIds: selectedSubjects,
            },
            imageFile: imageFile || undefined,
        })
        router.push('/student/dashboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <header className="p-6 flex justify-center">
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-200">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">LearnLink</span>
                </Link>
            </header>



            {/* Main Content */}
            <main className="flex justify-center px-4 pb-12">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Finalize Your Profile ✨
                        </h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Tell us a bit about yourself so we can match you with the perfect study partners.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* About You Card */}
                        <Card padding="lg">
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Profile Photo */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="h-28 w-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-20 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-0 right-0 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">Profile Photo</p>
                                    <p className="text-xs text-slate-400">Recommended: Square JPG or PNG, 400×400px</p>
                                </div>

                                {/* Name & Bio */}
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            placeholder="John"
                                            error={errors.firstName?.message}
                                            {...register('firstName')}
                                        />
                                        <Input
                                            label="Last Name"
                                            placeholder="Doe"
                                            error={errors.lastName?.message}
                                            {...register('lastName')}
                                        />
                                    </div>
                                    <div>
                                        <Textarea
                                            label="About You"
                                            placeholder="E.g., Junior Computer Science student passionate about AI and open-source. Looking for a group to tackle Data Structures this semester!"
                                            rows={3}
                                            error={errors.bio?.message}
                                            {...register('bio')}
                                        />
                                        <p className="text-right text-xs text-slate-400 mt-1">
                                            {bioValue.length}/160 CHARACTERS MAX
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Academic Focus Card */}
                        <Card padding="lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-primary-600" />
                                </div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Academic Focus</h2>
                            </div>

                            {/* Academic Level */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    Academic Level
                                </label>
                                <select
                                    className="input"
                                    {...register('academicLevel')}
                                >
                                    <option value="">Select your level</option>
                                    {ACADEMIC_LEVELS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                                {errors.academicLevel && (
                                    <p className="text-xs text-red-500 mt-1">{errors.academicLevel.message}</p>
                                )}
                            </div>

                            {/* Subjects & Skills */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    Subjects & Skills
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Add a subject (e.g. Organic Chemistry)..."
                                        value={subjectSearch}
                                        onChange={(e) => {
                                            setSubjectSearch(e.target.value)
                                            setShowSubjectDropdown(true)
                                        }}
                                        onFocus={() => setShowSubjectDropdown(true)}
                                        className="input pr-10"
                                    />
                                    <Plus className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    
                                    {showSubjectDropdown && filteredSubjects.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredSubjects.slice(0, 8).map(subject => (
                                                <button
                                                    key={subject.id}
                                                    type="button"
                                                    onClick={() => addSubject(subject.id)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                                >
                                                    {subject.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected subjects */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {selectedSubjects.map(subjectId => {
                                        const subject = subjects.find(s => s.id === subjectId)
                                        return subject ? (
                                            <span
                                                key={subject.id}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
                                            >
                                                {subject.name}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubject(subject.id)}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ) : null
                                    })}
                                </div>
                                {selectedSubjects.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2">Please select at least one subject</p>
                                )}
                            </div>
                        </Card>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={createProfile.isPending}
                                disabled={selectedSubjects.length === 0}
                            >
                                Complete Setup & Enter Dashboard
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>

                            <Link
                                href="/"
                                className="block text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                I'll do this later, take me to Home
                            </Link>
                        </div>
                    </form>

                    {/* Footer */}
                    <footer className="mt-12 text-center text-xs text-slate-400 space-y-2">
                        <p>© {new Date().getFullYear()} LearnLink Educational Platform</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
                            <Link href="/help" className="hover:text-slate-600">Help Center</Link>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    )
}
