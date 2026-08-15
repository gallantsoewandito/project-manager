'use client'

import { useState, useEffect } from 'react'
import { updateTaskDetails } from '@/actions/tasks'
import { X, ExternalLink, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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

interface TaskDetailsPanelProps {
  task: Task | null
  userRole: string
  userId: string
  onClose: () => void
}

export function TaskDetailsPanel({ task, userRole, userId, onClose }: TaskDetailsPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (task) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }, [task])

    if (!task) return null

    const isManager = userRole !== 'USER'
    const isAssignee = task.assignee?.id === userId

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        await updateTaskDetails(task.id, formData)
        setIsSaving(false)
    }

    const formatDate = (date: Date | null) => {
        if (!date) return 'No deadline set'
        return new Date(date).toLocaleDateString('en-US',{
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

     return (
        <div className={`fixed inset-0 z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Task Details</h2>
                <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                <form id="task-details-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <input 
                    name="title" 
                    defaultValue={task.title} 
                    readOnly={!isManager}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Deadline</label>
                    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {formatDate(task.dueDate)}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea 
                    name="description" 
                    defaultValue={task.description || ''} 
                    readOnly={!isManager}
                    placeholder="Add a description..."
                    rows={4}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 resize-none"
                    />
                </div>

                {isManager && (
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Submission Link (External)</label>
                    <input 
                        name="submissionLink" 
                        defaultValue={task.submissionLink || ''} 
                        placeholder="https://forms.gle/... or https://figma.com/..."
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <p className="text-xs text-slate-500">Provide a link for the user to submit their work.</p>
                    </div>
                )}

                {isAssignee && task.submissionLink && (
                    <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
                    <p className="text-sm font-medium text-blue-900 mb-2">Submission Link</p>
                    <a 
                        href={task.submissionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                        Open Submission Link <ExternalLink className="h-4 w-4" />
                    </a>
                    </div>
                )}

                {isAssignee && (
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Comments</label>
                    <textarea 
                        name="submissionNotes" 
                        defaultValue={task.submissionNotes || ''} 
                        placeholder="Add notes about your work completion or any relevant information..."
                        rows={5}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                    />
                    </div>
                )}

                {!isAssignee && !isManager && task.submissionNotes && (
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Submission Notes</label>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        {task.submissionNotes}
                    </div>
                    </div>
                )}
                </form>
            </div>

            <div className="border-t border-slate-200 px-6 py-4">
                {isManager ? (
                <Button 
                    type="submit" 
                    form="task-details-form" 
                    disabled={isSaving}
                    className="w-full"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                ) : isAssignee ? (
                <Button 
                    type="submit" 
                    form="task-details-form" 
                    disabled={isSaving}
                    className="w-full"
                >
                    {isSaving ? 'Saving...' : 'Save Completion Notes'}
                </Button>
                ) : (
                <p className="text-center text-sm text-slate-500">
                    Contact the assignee for updates on this task.
                </p>
                )}
            </div>
            </div>
        </div>
        </div>
    )
}