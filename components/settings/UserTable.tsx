'use client'

import { useState } from 'react'
import { updateUserRole, deleteUser } from '@/actions/users'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, UserCog } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: Date
}

interface UserTableProps {
  users: User[]
  currentUserId: string
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsProcessing(userId)
    await updateUserRole(userId, newRole)
    setIsProcessing(null)
  }

  const handleDelete = async (userId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    if (!isConfirmed) return

    setIsProcessing(userId)
    await deleteUser(userId)
    setIsProcessing(null)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Name</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Created</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Change Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {user.name || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="outline" 
                      className={getRoleBadgeColor(user.role)}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isProcessing === user.id || user.id === currentUserId}
                      className="text-xs rounded border-none bg-slate-100 text-slate-700 focus:ring-0 cursor-pointer px-2 py-1 outline-none disabled:opacity-50"
                    >
                      <option value="USER">User</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={isProcessing === user.id || user.id === currentUserId}
                      className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={user.id === currentUserId ? "Cannot delete your own account" : "Delete user"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}