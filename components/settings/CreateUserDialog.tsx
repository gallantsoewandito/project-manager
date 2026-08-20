'use client'

import { useState } from 'react'
import { createUser } from '@/actions/users'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    
    const result = await createUser(formData)
    
    setIsPending(false)
    
    if (result?.error) {
      setError(result.error)
      return
    }
    
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Plus className="w-4 h-4" />
        Add User
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. They will be able to log in with the credentials you provide.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="John Doe"
              required
              minLength={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select 
              id="role" 
              name="role" 
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            >
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}