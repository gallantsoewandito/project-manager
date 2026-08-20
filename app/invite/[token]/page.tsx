'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { setPassword } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InvitePage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string
    
    const [password, setPasswordState] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setIsPending(true)
        const result = await setPassword(token, password)
        setIsPending(false)

        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            setTimeout(() => router.push('/login'), 3000)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Project Manager</h1>
            <p className="text-slate-500 mb-6">Please set a password to activate your account.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPasswordState(e.target.value)}
                required
                minLength={6}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                />
            </div>
            
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
                </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Setting Password...' : 'Set Password'}
            </Button>
            </form>
        </div>
        </div>
    )
}