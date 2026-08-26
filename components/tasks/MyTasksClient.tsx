'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TaskDetailsPanel } from '@/components/tasks/TaskDetailsPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface Task {
  id: string
  title: string
  status: string
  dueDate: Date | null
  project: { id: string; name: string } | null
  assignee: { id: string; name: string | null } | null
}

interface MyTasksClientProps {
  tasks: Task[]
  userRole: string
  userId: string
}

export function MyTasksClient({ tasks, userRole, userId }: MyTasksClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTaskId = searchParams.get('taskId')

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null

  const closePanel = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('taskId')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-800 border-green-200'
      case 'REVIEW': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Task</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Project</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <p className="font-medium">No tasks assigned to you yet.</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {task.project?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {task.dueDate ? (
                        <span className={isOverdue(task.dueDate) && task.status !== 'DONE' ? 'text-red-600 font-medium' : 'text-slate-600'}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">No date</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString())
                          params.set('taskId', task.id)
                          router.push(`?${params.toString()}`, { scroll: false })
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View task</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Details Panel */}
      <TaskDetailsPanel 
        task={selectedTask as any} 
        userRole={userRole} 
        userId={userId} 
        onClose={closePanel} 
      />
    </div>
  )
}