'use client'

import { useState } from 'react'
import { TaskDetailsPanel } from '@/components/tasks/TaskDetailsPanel'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: Date | null
  submissionLink: string | null
  submissionNotes: string | null
  assignee: { id: string; name: string | null; email: string | null } | null
}

interface ProjectTaskListProps {
  tasks: Task[]
  userRole: string
  userId: string
}

export function ProjectTaskList({ tasks, userRole, userId }: ProjectTaskListProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    return (
        <>
        <div className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
                No tasks in this project yet.
            </div>
            ) : (
            tasks.map((task) => (
                <div 
                key={task.id} 
                className="px-6 py-4 flex items-center justify-between"
                >
                <div>
                    <h3 
                        className="text-sm font-medium text-slate-900 cursor-pointer hover:text-blue-600"
                        onClick={() => setSelectedTask(task)}
                    >{task.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                    Assigned to: {task.assignee ? (task.assignee.name || task.assignee.email) : 'Unassigned'}
                    </p>
                    {task.submissionLink && (
                    <a 
                        href={task.submissionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                        View Submission
                    </a>
                    )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                }`}>
                    {task.status.replace('_', ' ')}
                </span>
                </div>
            ))
            )}
        </div>

        <TaskDetailsPanel 
            task={selectedTask} 
            userRole={userRole} 
            userId={userId} 
            onClose={() => setSelectedTask(null)} 
        />
        </>
    )
}