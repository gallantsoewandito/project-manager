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
import { Plus, X, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface CreateProjectDialogProps {
  users: User[];
}

export function CreateProjectDialog({ users }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [addedMembers, setAddedMembers] = useState<{ userId: string; role: string; userName: string }[]>([]);

  const handleAddMember = () => {
    if (!selectedUserId) return;
    const user = users.find((u) => u.id === selectedUserId);
    if (user && !addedMembers.find((m) => m.userId === user.id)) {
      setAddedMembers([...addedMembers, { userId: user.id, role: selectedRole, userName: user.name || user.email }]);
      setSelectedUserId('');
    }
  }

  const handleRemoveMember = (userId: string) => {
    setAddedMembers(addedMembers.filter((m) => m.userId !== userId));
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true);

    if (addedMembers.length > 0) {
      formData.append('members', JSON.stringify(addedMembers));
    }

    const result = await createProject(formData);
    setIsPending(false);

    if (result?.error) {
      alert(result.error)
      return
    }
    
    setOpen(false);
    setAddedMembers([]);

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
      <DialogContent className="sm:max-w-[500px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to your workspace and optionally invite team members.
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

            {/* Invite Members Section */}
            <div className="grid gap-2">
              <Label>Invite Members (Optional)</Label>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                </select>
                <Button type="button" variant="outline" size="icon" onClick={handleAddMember}>
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              {/* Added Members List */}
              {addedMembers.length > 0 && (
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {addedMembers.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between p-2 bg-slate-50 rounded-md text-sm">
                      <span className="font-medium text-slate-700">{member.userName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 uppercase">{member.role}</span>
                        <button type="button" onClick={() => handleRemoveMember(member.userId)} className="text-slate-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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