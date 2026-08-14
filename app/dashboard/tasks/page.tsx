import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { DenseTaskTable } from '@/components/tasks/DenseTaskTable'
import { TaskDetailsPanel } from '@/components/tasks/TaskDetailsPanel'

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
        // Normal users only see tasks assigned to them
        tasks = await prisma.task.findMany({
            where: { assigneeId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                project: { select: { name: true } },
                assignee: { select: { id: true, name: true, email: true } },
            },
        })
    } else {
        // Managers and Admins see all tasks
        tasks = await prisma.task.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                project: { select: { name: true } },
                assignee: { select: { id: true, name: true, email: true } },
            },
        })
    }

    return (
        <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
            <p className="text-slate-500 mt-1">
                {userRole === 'USER' ? 'Your assigned tasks.' : 'Manage and track all team tasks.'}
            </p>
            </div>
            {/* Only Managers and Admins can create tasks */}
            {userRole !== 'USER' && (
            <CreateTaskDialog projects={projects} users={users} />
            )}
        </div>

        {/* Render different views based on role */}
        {userRole === 'USER' ? (
            <KanbanBoard initialTasks={tasks} userRole={userRole} userId={userId} />
        ) : (
            <DenseTaskTable tasks={tasks} users={users} userRole={userRole} userId={userId} />
        )}
        </div>
    )
}