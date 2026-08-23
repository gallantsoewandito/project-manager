import Link from 'next/link'

export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Approval Pending</h1>
        <p className="text-slate-600 mb-6">
          Your account has been created and is awaiting admin approval. 
          You will be able to log in once an administrator reviews your request.
        </p>
        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Return to Login
        </Link>
      </div>
    </div>
  )
}