import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, CheckSquare, Clock, TrendingUp, MoreHorizontal } from 'lucide-react';
import { getDashboardStats } from '@/actions/dashboard';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StatCard {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
}

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    const recentProjects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc'},
        take: 5,
    });

    const statCards: StatCard[] = [
        {
        title: 'Total Projects',
        value: stats.totalProjects.toString(),
        icon: FolderKanban,
        trend: 'Active workspaces',
        },
        {
        title: 'Active Tasks',
        value: stats.activeTasks.toString(),
        icon: CheckSquare,
        trend: 'Currently in progress',
        },
        {
        title: 'Pending Review',
        value: stats.pendingReview.toString(),
        icon: Clock,
        trend: 'Awaiting approval',
        },
        {
        title: 'Completion Rate',
        value: '0%', // We will calculate this later when we have completed tasks
        icon: TrendingUp,
        trend: 'Overall performance',
        },
    ];

    return (
        <div className="space-y-8">
        {/* Page Header - Updated to include the Dialog */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back. Here is an overview of your projects.</p>
            </div>
            <CreateProjectDialog />
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
            <Card key={stat.title} className="border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
                </CardContent>
            </Card>
            ))}
        </div>

        {/* Placeholder sections remain the same */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Projects List */}
            <Card className="col-span-4 border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
                {recentProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm">
                    <p>No projects yet.</p>
                    <p className="text-xs mt-1">Click "New Project" to get started.</p>
                </div>
                ) : (
                <div className="space-y-4">
                    {recentProjects.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{project.name}</p>
                            <p className="text-xs text-slate-500">{project.description || 'No description'}</p>
                        </div>
                        </div>
                        <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                            {project.status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger 
                            render={
                                <Button variant="ghost" size="icon" className="h-8 w-8" />
                            }
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </CardContent>
            </Card>

            <Card className="col-span-3 border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">Task Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-md">
                Task chart will load here
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}
