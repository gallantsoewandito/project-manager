import { prisma } from '@/lib/prisma';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role || 'USER'
  const userId = (session?.user as any)?.id

  const users = await prisma.user.findMany({
    where: { isApproved: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  let projects
  if (userRole === 'ADMIN' || userRole === 'MANAGER') {
    projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } else {
    projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and track all your active workspaces.</p>
        </div>
        {userRole !== 'USER' && <CreateProjectDialog users={users} />}
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  {userRole === 'USER' 
                    ? 'You have not been added to any projects yet.' 
                    : 'No projects found. Create your first project to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium text-slate-900">{project.name}</TableCell>
                  <TableCell className="text-slate-600 max-w-xs truncate">
                    {project.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {project.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link 
                      href={`/dashboard/projects/${project.id}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}