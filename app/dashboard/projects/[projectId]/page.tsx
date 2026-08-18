import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { ProjectTaskList } from '@/components/projects/ProjectTaskList'

interface PageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { projectId } = await params

    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role || 'USER'
    const userId = (session?.user as any)?.id

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            tasks: {
                include :{
                    assignee: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!project) {
        notFound()
    }

    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter((task: any) => task.status === 'DONE').length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
    })

    return (
        <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                Back to Projects
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{project.name}</h1>
            <p className="text-slate-500 mt-1">{project.description || 'No description provided.'}</p>
            </div>
            {userRole !== 'USER' && (
            <CreateTaskDialog projects={[{ id: project.id, name: project.name }]} users={users} defaultProjectId={project.id} />
            )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900">Project Progress</h2>
            <span className="text-sm font-medium text-slate-600">{progress}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
            ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
            {completedTasks} of {totalTasks} tasks completed.
            </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            </div>
            
            <ProjectTaskList 
            tasks={project.tasks} 
            userRole={userRole} 
            userId={userId} 
            />
            
        </div>
        </div>
    )
}