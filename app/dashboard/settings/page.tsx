import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { User, ShieldCheck, ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role || 'USER'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and system preferences.</p>
      </div>

      {/* Row-based Layout Container */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        
        {/* Profile Row */}
        <Link 
          href="/dashboard/settings/profile" 
          className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Profile</h2>
              <p className="text-sm text-slate-500">Update your personal information and password.</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </Link>

        {/* User Management Row (Admin Only) */}
        {userRole === 'ADMIN' && (
          <Link 
            href="/dashboard/settings/users" 
            className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">User Management</h2>
                <p className="text-sm text-slate-500">Add, manage, and assign roles to system users.</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  )
}