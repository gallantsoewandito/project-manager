import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { CreateUserDialog } from '@/components/settings/CreateUserDialog'
import { UserTable } from '@/components/settings/UserTable'

export default async function UserManagementPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role || 'USER'
  const currentUserId = (session?.user as any)?.id

  // Strictly block non-admins from even loading this page
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Add, manage, and assign roles to system users.</p>
        </div>
        <CreateUserDialog />
      </div>

      <UserTable users={users} currentUserId={currentUserId} />
    </div>
  )
}