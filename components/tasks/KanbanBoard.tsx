'use client'

import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { TaskDetailsPanel } from './TaskDetailsPanel'
import { clearCompletedTasks, updateTaskStatus, clearNudge } from '@/actions/tasks'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: Date | null
  nudgedAt: Date | null
  submissionLink: string | null
  submissionNotes: string | null
  createdAt: Date
  project: { name: string }
  assignee: { id: string; name: string | null; email: string | null } | null    
}

interface KanbanBoardProps {
  initialTasks: Task[]
  userRole: string
  userId: string
}

const columns = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-100 border-slate-200' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'REVIEW', title: 'Review', color: 'bg-amber-50 border-amber-200' },
  { id: 'DONE', title: 'Done', color: 'bg-green-50 border-green-200' },
]

export function KanbanBoard({ initialTasks, userRole, userId }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
    const [isClearing, setIsClearing] = useState(false)
    const [sortBy, setSortBy] = useState('createdAt')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault()
        if (!draggedTaskId) return

        const updatedTasks = tasks.map((task) =>
            task.id === draggedTaskId ? {...task, status: newStatus} : task
        )

        setTasks(updatedTasks)
        setDraggedTaskId(null)

        await updateTaskStatus(draggedTaskId, newStatus)
    }

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
        )
        
        setTasks(updatedTasks)
        await updateTaskStatus(taskId, newStatus)
    }

    const handleClearDone = async () => {
        setIsClearing(true)
        await clearCompletedTasks()
        setIsClearing(false)

        const remainingTasks = tasks.filter((task) => task.status !== 'DONE')
        setTasks(remainingTasks)
    }

    const handleDismissNudge = async (taskId: string) => {
        const updatedTasks = tasks.map((task) => 
            task.id === taskId ? {...task, nudgedAt: null} : task
        )

        setTasks(updatedTasks)
        await clearNudge(taskId)
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
        <div className="space-y-4">
        <div className="flex justify-end">
            <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 sm:w-auto"
            >
            <option value="createdAt">Sort by: Date Created</option>
            <option value="dueDate">Sort by: Deadline</option>
            </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => {
            const columnTasks = sortedTasks.filter((task) => task.status === column.id)

            return (
                <div
                key={column.id}
                className="flex flex-col gap-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                >
                <div className={`flex items-center justify-between p-3 rounded-lg border ${column.color}`}>
                    <h3 className="font-semibold text-slate-900">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white/50">
                    {columnTasks.length}
                    </Badge>
                    {column.id === 'DONE' && columnTasks.length > 0 && (
                    <button
                        onClick={handleClearDone}
                        disabled={isClearing}
                        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 transition-colors"
                    >
                        {isClearing ? 'Clearing...' : 'Clear'}
                    </button>
                    )}
                </div>

                <div className="flex flex-col gap-3 min-h-[200px]">
                    {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                        Drop tasks here
                    </div>
                    ) : (
                    columnTasks.map((task) => (
                        <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-grab active:cursor-grabbing"
                        >
                        <Card className={`border-slate-200 shadow-sm hover:shadow-md transition-shadow ${task.nudgedAt ? 'border-red-200 ring-1 ring-red-100' : ''}`}
                            onClick={() => setSelectedTask(task)}
                        >
                            <CardHeader className="p-4 pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm font-medium text-slate-900 leading-tight flex items-center gap-2">
                                {task.title}
                                {task.nudgedAt && (
                                    <span
                                    onClick={() => handleDismissNudge(task.id)}
                                    className="w-2 h-2 rounded-full bg-red-500 cursor-pointer hover:bg-red-600"
                                    title="Manager requested an update. Click to dismiss."
                                    />
                                )}
                                </CardTitle>
                                <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] h-5 rounded border-none bg-slate-100 text-slate-600 focus:ring-0 cursor-pointer px-1 py-0 outline-none"
                                >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">Review</option>
                                <option value="DONE">Done</option>
                                </select>
                            </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                            {task.description && (
                                <p className="text-xs text-slate-500 line-clamp-2">
                                {task.description}
                                </p>
                            )}
                            {task.dueDate && (
                                <div className={`flex items-center gap-1.5 text-xs ${
                                new Date(task.dueDate) < new Date() && task.status !== 'DONE' 
                                    ? 'text-red-600 font-medium' 
                                    : 'text-slate-500'
                                }`}>
                                <Calendar className="h-3 w-3" />
                                <span>
                                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <Badge variant="outline" className="text-[10px] h-5">
                                {task.project.name}
                                </Badge>
                                <span className="text-[10px] text-slate-400">
                                {format(new Date(task.createdAt), 'MMM d')}
                                </span>
                            </div>
                            </CardContent>
                        </Card>
                        </div>
                    ))
                    )}
                </div>
                </div>
            )
            })}
        </div>
        <TaskDetailsPanel 
            task={selectedTask} 
            userRole={userRole} 
            userId={userId} 
            onClose={() => setSelectedTask(null)} 
        />
        </div>
    )
}