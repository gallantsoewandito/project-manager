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

function CircularProgress({ percentage }: { percentage: number}) {
    const radius = 36
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle
                className="text-slate-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
                />
                <circle
                className="text-blue-600 transition-all duration-500 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
                <span className="text-xs text-slate-500">Complete</span>
            </div>
        </div>
    )
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
            <CreateTaskDialog 
                projects={[{ id: project.id, name: project.name }]} 
                users={users} 
                defaultProjectId={project.id} 
            />
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Task List */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            </div>
            
            <ProjectTaskList 
                tasks={project.tasks} 
                userRole={userRole} 
                userId={userId} 
            />
            </div>

            {/* Right Side: Progress Ring */}
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold text-slate-900 mb-8">Project Progress</h2>
            
            <CircularProgress percentage={progress} />
            
            <p className="text-sm text-slate-500 mt-8 text-center">
                {completedTasks} of {totalTasks} tasks completed.
            </p>
            </div>
        </div>
        </div>
    )
}