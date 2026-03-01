'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useVerifyEmail } from '../../../hookes'
import { Card, Button, Spinner, Input } from '@/components/ui'
import { CheckCircle2, Mail, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
    const params = useSearchParams()
    const router = useRouter()
    const codeFromUrl = params.get('code')
    const [code, setCode] = useState(codeFromUrl || '') // state pour input
    const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'waiting'>(codeFromUrl ? 'pending' : 'waiting')
    const verifyEmail = useVerifyEmail()

    async function onSubmit() {
        if (!code) return
        try {
            await verifyEmail.mutateAsync(code)
            setStatus('success')
            setTimeout(() => router.push('/auth/login'), 2000)
        } catch (err) {
            setStatus('error')
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card padding="lg" className="text-center">
                {status === 'pending' && (
                    <>
                        <Spinner className="mx-auto h-12 w-12 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Verifying your email…</h2>
                    </>
                )}

                {status === 'waiting' && (
                    <>
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center">
                            <Mail className="h-8 w-8 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Enter your verification code</h2>
                        <p className="text-slate-500 text-sm mb-4">Type the code sent to your email to verify your account.</p>

                        {/* Input pour le code */}
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter code"
                            className="mb-4"
                        />
                        <Button onClick={onSubmit} className="w-full mb-2">Verify Email</Button>

                        <p className="text-xs text-slate-400">Didn't receive it? Check your spam folder or</p>
                        <Button variant="ghost" size="sm" className="mt-1">Resend email</Button>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-secondary-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-secondary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-secondary-700 mb-2">Email Verified!</h2>
                        <p className="text-slate-500 text-sm mb-6">Your account is now active. Welcome to LearnLink!</p>
                        <Link href="/login">
                            <Button className="w-full">Go to Login</Button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-red-700 mb-2">Invalid Code</h2>
                        <p className="text-slate-500 text-sm mb-6">This verification link is invalid or has expired.</p>
                        <Link href="/register">
                            <Button variant="outline" className="w-full">Back to Register</Button>
                        </Link>
                    </>
                )}
            </Card>
        </div>
    )
}