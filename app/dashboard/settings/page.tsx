import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role || 'USER'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/settings/profile" 
          className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <p className="text-sm text-slate-500 mt-2">Update your personal information and password.</p>
        </Link>

        {userRole === 'ADMIN' && (
          <Link 
            href="/dashboard/settings/users" 
            className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500 mt-2">Add, manage, and assign roles to system users.</p>
          </Link>
        )}
      </div>
    </div>
  )
}