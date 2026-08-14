'use client'

import { useState } from 'react'
import { updateTaskStatus, updateTaskAssignee, nudgeTask, deleteTask, deleteAllTasks } from '@/actions/tasks'
import { Bell, Trash2, Edit2 } from 'lucide-react'
import { TaskDetailsPanel } from './TaskDetailsPanel'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  submissionLink: string | null
  submissionNotes: string | null
  project: { name: string }
  assignee: { id: string; name: string | null; email: string | null } | null
}

interface DenseTaskTableProps {
  tasks: Task[]
  users: { id: string; name: string | null; email: string | null }[]
  userRole: string
  userId: string
}

export function DenseTaskTable({ tasks, users, userRole, userId }: DenseTaskTableProps) {
    const [tasksState, setTasksState] = useState<Task[]>(tasks)
    const [sortBy, setSortBy] = useState('createdAt')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        await updateTaskStatus(taskId, newStatus)
    }

    const hanldeAssigneeChange = async (taskId: string, newAssigneeId: string) => {
        await updateTaskAssignee(taskId, newAssigneeId)
    }

    const handleNudge = async (taskId: string) => {
        await nudgeTask(taskId)
    }

    const handleDelete = async (taskId: string) => {
        const isConfirmed = window.confirm('Are you sure you want to delete this task?')
        if (!isConfirmed) return

        const updatedTasks = tasksState.filter((task) => task.id !== taskId)
        setTasksState(updatedTasks)
        await deleteTask(taskId)
    }

    const handleDeleteAll = async () => {
        const isConfirmed = window.confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')
        if (!isConfirmed) return

        setTasksState([])
        await deleteAllTasks()
    }

    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortBy === 'dueDate') {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
            return dateA - dateB
        }

        return new Date(b.id).getTime() - new Date(a.id).getTime()
    })

    return (
        <>
        <div className="space-y-4">
        <div className="flex justify-end items-center gap-3">
            <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-slate-800 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
                Delete All Tasks
            </button>
            <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 sm:w-auto"
            >
            <option value="createdAt">Sort by: Date Created</option>
            <option value="dueDate">Sort by: Deadline</option>
            </select>
        </div>

        <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Title</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Project</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Assigned To</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Deadline</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {sortedTasks.length === 0 ? (
                    <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                        No tasks found.
                    </td>
                    </tr>
                ) : (
                    sortedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-900 cursor-pointer hover:text-blue-500"
                            onClick={() => setSelectedTask(task)}>{task.title}</td>
                        <td className="py-2 px-3 text-slate-600">{task.project.name}</td>
                        <td className="py-2 px-3">
                            <select
                                value={task.assignee?.id || ''}
                                onChange={(e) => hanldeAssigneeChange(task.id, e.target.value)}
                                className="text-xs rounded border-none bg-slate-100 text-slate-700 focus:ring-0 cursor-pointer px-2 py-1 outline-none w-full max-w-[150px]"
                            >
                                <option value="">Unassigned</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name || user.email}
                                        </option>
                                    ))}
                            </select>
                        </td>
                        <td className="py-2 px-3">
                            <select 
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="text-xs rounded border-none bg-slate-100 text-slate-700 focus:ring-0 cursor-pointer px-2 py-1 outline-none"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">Review</option>
                                <option value="DONE">Done</option>
                            </select>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleNudge(task.id)}
                                    className="text-slate-400 hover:text-amber-500 transition-colors"
                                    title="Notify Assignee"
                                >
                                    <Bell className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setSelectedTask(task)}
                                    className="text-slate-400 hover:text-amber-500 transition-colors"
                                    title="Edit Task"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(task.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                    title="Delete Task"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>
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