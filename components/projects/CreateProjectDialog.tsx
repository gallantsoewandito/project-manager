'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/actions/projects';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { resumeToFizzStream } from 'next/dist/server/app-render/stream-ops.node';

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        const result = await createProject(formData);
        setIsPending(false);

        if (result?.error) {
            alert(result.error)
            return
        }
        setOpen(false);
        if (result.id) {
            router.push(`/dashboard/projects/${result.id}`)
        } else {
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger 
            render={
                <Button className="gap-2" />
            }
        >
            <Plus className="w-4 h-4" />
            New Project
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <form action={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                Add a new project to your workspace. You can assign tasks to it later.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                    id="name" 
                    name="name" 
                    placeholder="e.g., Website Redesign" 
                    required 
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                    id="description" 
                    name="description" 
                    placeholder="Briefly describe the project goals" 
                />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Project'}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    );
}