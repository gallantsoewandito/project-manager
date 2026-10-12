'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserNavProps {
  userName: string
  userRole: string
}

export function UserNav({ userName, userRole }: UserNavProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium text-slate-900">{userName}</p>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{userRole}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="gap-2 border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  )
}