'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTask } from '@/actions/tasks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

interface CreateTaskDialogProps {
    projects: { id: string; name: string }[]
    users: { id: string; name: string | null; email: string | null }[]
    defaultProjectId: string
}

export function CreateTaskDialog({ projects, users, defaultProjectId }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        await createTask(formData)
        setIsPending(false)
        setOpen(false)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
            render={
            <Button className="gap-2" />
            }
        >
            <Plus className="w-4 h-4" />
            New Task
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <form action={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                Add a new task and assign it to a team member.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" name="title" placeholder="e.g., Design Homepage" required />
                </div>
                
                <div className="grid gap-2">
                <Label htmlFor="projectId">Project</Label>
                <select 
                    id="projectId" 
                    name="projectId" 
                    defaultValue={defaultProjectId || ''}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                        {project.name}
                    </option>
                    ))}
                </select>
                </div>

                <div className="grid gap-2">
                <Label htmlFor="assigneeId">Assign to</Label>
                <select 
                    id="assigneeId" 
                    name="assigneeId" 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name || user.email}
                    </option>
                    ))}
                </select>
                </div>

                <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select 
                    id="status" 
                    name="status" 
                    defaultValue="TODO"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                </select>
                </div>

                <div className="grid gap-2">
                <Label htmlFor="dueDate">Deadline</Label>
                <Input id="dueDate" name="dueDate" type="date" />
                </div>

                <div className="grid gap-2">
                <Label htmlFor="submissionLink">Submission Link (Optional)</Label>
                <Input 
                    id="submissionLink" 
                    name="submissionLink" 
                    type="url" 
                    placeholder="https://forms.gle/..., etc"
                />
                </div>

                <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" placeholder="Briefly describe the task" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Task'}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    )
}