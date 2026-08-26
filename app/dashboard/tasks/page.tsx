import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { DenseTaskTable } from '@/components/tasks/DenseTaskTable'
import { MyTasksClient } from '@/components/tasks/MyTasksClient'

export default async function TasksPage() {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role || 'USER'
    const userId = (session?.user as any)?.id

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
    })

    const projects = await prisma.project.findMany({
        select: { id: true, name: true },
    })

    let tasks = []
    if (userRole === 'USER') {
        tasks = await prisma.task.findMany({
            where: { assigneeId: userId },
            orderBy: [
                { status: 'asc' },
                { dueDate: 'asc' }
            ],
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true, email: true } },
            },
        })
    } else {
        tasks = await prisma.task.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true, email: true } },
            },
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {userRole === 'USER' ? 'My Tasks' : 'All Tasks'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {userRole === 'USER' ? 'A focused view of tasks assigned specifically to you.' : 'Manage and track all team tasks.'}
                    </p>
                </div>
                
                {userRole !== 'USER' && (
                    <CreateTaskDialog projects={projects} users={users} />
                )}
            </div>

            {userRole === 'USER' ? (
                <MyTasksClient 
                    tasks={tasks as any} 
                    userRole={userRole} 
                    userId={userId} 
                />
            ) : (
                <DenseTaskTable 
                    tasks={tasks} 
                    users={users} 
                    userRole={userRole} 
                    userId={userId} 
                />
            )}
        </div>
    )
}