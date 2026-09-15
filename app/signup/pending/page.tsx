import { Suspense } from 'react'
import PendingClient from '@/components/auth/PendingClient'

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <p className="text-slate-500">Loading approval status...</p>
        </div>
      </div>
    }>
      <PendingClient />
    </Suspense>
  )
}