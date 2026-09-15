'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { checkApprovalStatus } from '@/actions/users'

export default function PendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [isApproved, setIsApproved] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Checking status...')

  useEffect(() => {
    if (!email) return

    const checkStatus = async () => {
      const result = await checkApprovalStatus(email)

      if (result.approved) {
        setIsApproved(true)
        setStatusMessage('Your account has been approved! Redirecting to login...')
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setStatusMessage('Awaiting admin approval. Please keep this page open.')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)

    return () => clearInterval(interval)
  }, [email, router])

    if (isApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Approved</h1>
          <p className="text-slate-600">{statusMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
          <svg className="h-6 w-6 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Approval Pending</h1>
        <p className="text-slate-600 mb-2">
          Your account for <strong>{email}</strong> is awaiting admin approval.
        </p>
        <p className="text-sm text-slate-500 mb-6">
          {statusMessage}
        </p>
        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
          Return to Login
        </Link>
      </div>
    </div>
  )
}