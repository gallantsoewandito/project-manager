import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileSettingsClient from '@/components/settings/ProfileSettingsClient'
import Link from 'next/link'

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  
  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId},
    select: {
      name: true,
      email: true,
    }
  })

  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
            Back to Settings
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account details and security.</p>
      </div>

      <ProfileSettingsClient 
        currentName={user.name || ''} 
        currentEmail={user.email || ''} 
      />
    </div>
  )
}