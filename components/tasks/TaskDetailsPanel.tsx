'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Calendar, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateTaskDetails, updateTaskStatus, updateTaskAssignee, nudgeTask, clearNudge } from '@/actions/tasks'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: Date | null
  submissionLink: string | null
  submissionNotes: string | null
  nudgedAt: Date | null // Added for nudge status
  assignee: { id: string; name: string | null; email: string | null } | null
}

interface TaskDetailsPanelProps {
  task: Task | null
  userRole: string
  userId: string
  users: { id: string; name: string | null; email: string }[] // Added users prop
  onClose: () => void
}

export function TaskDetailsPanel({ task, userRole, userId, users, onClose }: TaskDetailsPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isProcessingAction, setIsProcessingAction] = useState(false)

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

    const handleSave = async (markAsDone = false) => {
        setIsSaving(true)
        const form = document.getElementById('task-details-form') as HTMLFormElement
        const formData = new FormData(form)

        await updateTaskDetails(task.id, formData)

        if (markAsDone && task.status !== 'DONE') {
            await updateTaskStatus(task.id, 'DONE')
        }
            
        setIsSaving(false)
        onClose()
    }

    const handleAssigneeChange = async (newAssigneeId: string) => {
        setIsProcessingAction(true)
        const result = await updateTaskAssignee(task.id, newAssigneeId)
        setIsProcessingAction(false)
        if (result?.error) alert(result.error)
        else onClose()
    }

    const handleNudge = async () => {
        setIsProcessingAction(true)
        const result = await nudgeTask(task.id)
        setIsProcessingAction(false)
        if (result?.error) alert(result.error)
        else {
            alert('Nudge sent successfully.')
            onClose()
        }
    }

    const handleClearNudge = async () => {
        setIsProcessingAction(true)
        await clearNudge(task.id)
        setIsProcessingAction(false)
        onClose()
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
                <form id="task-details-form" className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <input 
                    name="title" 
                    defaultValue={task.title} 
                    readOnly={!isManager}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
                    />
                </div>

                {/* NEW: Assignee Section (Managers Only) */}
                {isManager && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Assigned To</label>
                        <select
                            defaultValue={task.assignee?.id || ''}
                            onChange={async (e) => await handleAssigneeChange(e.target.value)}
                            disabled={isProcessingAction}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
                        >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name || user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Deadline</label>
                    {isManager ? (
                        <input 
                            type="date"
                            name="dueDate" 
                            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                    ) : (
                        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        {formatDate(task.dueDate)}
                        </div>
                    )}
                </div>

                {/* NEW: Nudge Section (Managers Only) */}
                {isManager && task.status !== 'DONE' && (
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                        <div>
                            <p className="text-sm font-medium text-slate-900">Task Reminder</p>
                            <p className="text-xs text-slate-500">
                                {task.nudgedAt ? 'Nudge was sent.' : 'Remind the assignee about this task.'}
                            </p>
                        </div>
                        {task.nudgedAt ? (
                            <Button variant="outline" size="sm" onClick={handleClearNudge} disabled={isProcessingAction} className="gap-2">
                                <BellOff className="h-4 w-4" /> Clear
                            </Button>
                        ) : (
                            <Button size="sm" onClick={handleNudge} disabled={isProcessingAction} className="gap-2">
                                <Bell className="h-4 w-4" /> Nudge
                            </Button>
                        )}
                    </div>
                )}

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
                    <label className="text-sm font-medium text-slate-700">Submission Link (Optional)</label>
                    <input 
                        name="submissionLink" 
                        defaultValue={task.submissionLink || ''} 
                        placeholder="https://forms.gle/..."
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
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

            <div className="border-t border-slate-200 px-6 py-4 flex gap-3">
                {isManager ? (
                <>
                    <Button type="button" variant="outline" onClick={() => handleSave(false)} disabled={isSaving} className="flex-1">
                    {isSaving ? 'Saving...' : 'Save and Back'}
                    </Button>
                    <Button type="button" onClick={() => handleSave(true)} disabled={isSaving || task.status === 'DONE'} className="flex-1">
                    {isSaving ? 'Saving...' : 'Save & Mark as Done'}
                    </Button>
                </>
                ) : isAssignee ? (
                <>
                    <Button type="button" variant="outline" onClick={() => handleSave(false)} disabled={isSaving} className="flex-1">
                    {isSaving ? 'Saving...' : 'Save and Back'}
                    </Button>
                    <Button type="button" onClick={() => handleSave(true)} disabled={isSaving || task.status === 'DONE'} className="flex-1">
                    {isSaving ? 'Saving...' : 'Save & Mark as Done'}
                    </Button>
                </>
                ) : (
                <Button type="button" variant="outline" onClick={onClose} className="w-full">
                    Close
                </Button>
                )}
            </div>
            </div>
        </div>
        </div>
    )
}