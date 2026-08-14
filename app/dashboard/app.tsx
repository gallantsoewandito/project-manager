import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, CheckSquare, Clock, TrendingUp } from 'lucide-react';

const stats = [
    {
        title: 'Total Projects',
        value: '12',
        icon: FolderKanban,
        trend: '+2 this month',
    },
    {
        title: 'Active Tasks',
        value: '48',
        icon: CheckSquare,
        trend: '+5 this week',
    },
    {
        title: 'Pending Review',
        value: '7',
        icon: Clock,
        trend: '-2 from yesterday',
    },
    {
        title: 'Completion Rate',
        value: '84%',
        icon: TrendingUp,
        trend: '+12% this month',
    },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
        {/* Page Header */}
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back. Here is an overview of your projects.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
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

        {/* Placeholder for Recent Activity / Projects List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-md">
                Project list will load here
                </div>
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