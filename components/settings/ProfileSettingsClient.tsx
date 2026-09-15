'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileSettingsClientProps {
  currentName: string
  currentEmail: string
}

export default function ProfileSettingsClient({ currentName, currentEmail }: ProfileSettingsClientProps) {
  const router = useRouter()
  const [name, setName] = useState(currentName)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsPending(true)

    const formData = new FormData()
    formData.append('name', name)
    
    if (newPassword) {
      formData.append('newPassword', newPassword)
      formData.append('confirmPassword', confirmPassword)
    }

    const result = await updateUserProfile(formData)
    setIsPending(false)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Name and Email Section */}
      <div className="space-y-4 p-6 bg-white rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={currentEmail}
            disabled
            className="bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500">Email addresses cannot be changed. Contact an administrator if needed.</p>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="space-y-4 p-6 bg-white rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
        <p className="text-sm text-slate-500">Leave this blank if you do not want to change your password.</p>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 chars, 1 uppercase, 1 digit"
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!newPassword}
          />
        </div>
      </div>

      {/* Feedback Message */}
      {message && (
        <div className={`p-4 rounded-md border ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border-red-200' 
            : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}