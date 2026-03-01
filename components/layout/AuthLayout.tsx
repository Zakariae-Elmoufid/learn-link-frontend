import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
            {/* Header */}
            <header className="p-6">
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-200">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">LearnLink</span>
                </Link>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-xs text-slate-400">
                © {new Date().getFullYear()} LearnLink · Connect, Learn, Grow
            </footer>
        </div>
    )
}