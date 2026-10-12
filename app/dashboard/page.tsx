import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FolderKanban, CheckSquare, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const userRole = (session?.user as any)?.role || 'USER'
    const userName = (session?.user as any)?.name || 'User'
    const organizationId = (session?.user as any)?.organizationId

    // 1. Fetch users for the Create Project Dialog (Scoped to Org)
    const users = await prisma.user.findMany({
        where: { 
            isApproved: true,
            organizationMemberships: {
                some: { organizationId }
            }
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
    })

    let totalProjects = 0
    let totalTasks = 0
    let completedTasks = 0
    let pendingReview = 0
    let recentProjects = []

    // 2. Calculate Stats (Scoped to Org)
    if (userRole === 'ADMIN') {
        // Global Platform Admin sees everything
        totalProjects = await prisma.project.count()
        totalTasks = await prisma.task.count()
        completedTasks = await prisma.task.count({ where: { status: 'DONE' } })
        pendingReview = await prisma.task.count({ where: { status: 'REVIEW' } })

        recentProjects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { _count: { select: { tasks: true } } }
        })
    } else {
        // Org Admins and Members only see their organization's data
        totalProjects = await prisma.project.count({ where: { organizationId } })
        totalTasks = await prisma.task.count({ where: { project: { organizationId } } })
        completedTasks = await prisma.task.count({ where: { project: { organizationId }, status: 'DONE' } })
        pendingReview = await prisma.task.count({ where: { project: { organizationId }, status: 'REVIEW' } })

        recentProjects = await prisma.project.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { _count: { select: { tasks: true } } }
        })
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const pendingApprovals = userRole === 'ADMIN'
        ? await prisma.user.count({ where: { isApproved: false } })
        : 0

    const myActionItems = await prisma.task.findMany({
        where: {
        assigneeId: userId,
        project: { organizationId }
        },
        include: { project: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5
    })

    return (
        <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {userName}
            </h1>
            <p className="text-slate-500 mt-1">
                {userRole === 'ADMIN' 
                ? 'Here is an overview of the entire system.' 
                : 'Here is an overview of your organization.'}
            </p>
            </div>
            {(userRole === 'ADMIN' || (session?.user as any)?.orgRole === 'ORG_ADMIN') && (
            <CreateProjectDialog users={users} />
            )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Projects" value={totalProjects.toString()} icon={FolderKanban} trend="Active workspaces" />
            <StatCard title="Active Tasks" value={totalTasks.toString()} icon={CheckSquare} trend="Across all projects" />
            <StatCard title="Pending Review" value={pendingReview.toString()} icon={Clock} trend="Awaiting approval" />
            <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} trend="Overall performance" />
        </div>

        {userRole === 'ADMIN' && pendingApprovals > 0 && (
            <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                    <p className="font-medium text-amber-900">
                    {pendingApprovals} User{pendingApprovals > 1 ? 's are' : ' is'} awaiting approval
                    </p>
                    <p className="text-sm text-amber-700">Review and assign roles to new sign-ups.</p>
                </div>
                </div>
                <Link href="/dashboard/settings/users">
                <Button variant="outline" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100">Review Now</Button>
                </Link>
            </CardContent>
            </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900">Recent Projects</CardTitle>
                <Link href="/dashboard/projects"><Button variant="ghost" size="sm" className="text-slate-600">View All</Button></Link>
            </CardHeader>
            <CardContent>
                {recentProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm">
                    <p>No projects yet.</p>
                    <p className="text-xs mt-1">Create a project to get started.</p>
                </div>
                ) : (
                <div className="space-y-3">
                    {recentProjects.map((project: any) => (
                    <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <FolderKanban className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{project.name}</p>
                            <p className="text-xs text-slate-500">{project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}</p>
                        </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{project.status || 'Active'}</Badge>
                    </Link>
                    ))}
                </div>
                )}
            </CardContent>
            </Card>

            <Card className="col-span-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900">Action Items</CardTitle>
                <Link href="/dashboard/tasks"><Button variant="ghost" size="sm" className="text-slate-600">View All</Button></Link>
            </CardHeader>
            <CardContent>
                {myActionItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm">
                    <p className="text-xs mt-1">No pending tasks assigned to you.</p>
                </div>
                ) : (
                <div className="space-y-3">
                    {myActionItems.map((task: any) => (
                    <div key={task.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{task.title}</p>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${task.status === 'REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' : task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            {task.status.replace('_', ' ')}
                        </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {task.project?.name || 'Unassigned Project'}
                        </p>
                        {task.dueDate && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        )}
                    </div>
                    ))}
                </div>
                )}
            </CardContent>
            </Card>
        </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: React.ElementType; trend: string }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{trend}</p>
      </CardContent>
    </Card>
  )
}