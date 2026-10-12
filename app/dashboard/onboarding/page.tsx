'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrganization, joinOrganization } from '@/actions/organizations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setError(null)

    let result
    if (mode === 'create') {
      result = await createOrganization(formData)
    } else {
      result = await joinOrganization(formData)
    }

    setIsPending(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        
        {/* Create Organization Card */}
        <Card className={`cursor-pointer transition-all ${mode === 'create' ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-slate-300'}`} onClick={() => setMode('create')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Create a New Organization</CardTitle>
            <CardDescription>
              Start a new workspace for your company or team. You will be assigned as the Organization Admin.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Join Organization Card */}
        <Card className={`cursor-pointer transition-all ${mode === 'join' ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-slate-300'}`} onClick={() => setMode('join')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Join an Existing Organization</CardTitle>
            <CardDescription>
              Enter an invite code provided by your Organization Admin to join their workspace.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Action Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'create' ? 'Create Your Organization' : 'Join an Organization'}
              </CardTitle>
              <CardDescription>
                {mode === 'create' 
                  ? 'Choose a unique name for your workspace.' 
                  : 'Enter the 8-character invite code to gain access.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-4">
                {mode === 'create' ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="e.g., Acme Corporation" 
                      required 
                      minLength={2}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input 
                      id="inviteCode" 
                      name="inviteCode" 
                      placeholder="e.g., X7K9P2M1" 
                      required 
                      maxLength={8}
                      className="uppercase"
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Processing...' : (mode === 'create' ? 'Create Organization' : 'Join Organization')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}