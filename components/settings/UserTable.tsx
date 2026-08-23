'use client'

import { useState } from 'react'
import { approveUser, deleteUser } from '@/actions/users'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle, XCircle } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  isApproved: boolean
  createdAt: Date
}

interface UserTableProps {
  users: User[]
  currentUserId: string
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})

  const handleRoleSelect = (userId: string, role: string) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role}))
  }

  const handleApprove = async (userId: string) => {
    const role = selectedRoles[userId] || 'USER'
    setIsProcessing(userId)
    await approveUser(userId, role)
    setIsProcessing(null)
  }

  const handleDelete = async (userId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    if (!isConfirmed) return

    setIsProcessing(userId)
    await deleteUser(userId)
    setIsProcessing(null)
  }

  const pendingUsers = users.filter(user => !user.isApproved)
  const approvedUsers = users.filter(user => user.isApproved)

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
    <div className="space-y-6">
      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <div className="border border-amber-200 rounded-lg bg-amber-50 overflow-hidden">
          <div className="px-4 py-3 bg-amber-100 border-b border-amber-200">
            <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Pending Approvals ({pendingUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-100/50 border-b border-amber-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-amber-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-amber-900">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-amber-900">Requested</th>
                  <th className="text-left py-3 px-4 font-medium text-amber-900">Assign Role</th>
                  <th className="text-left py-3 px-4 font-medium text-amber-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-amber-100/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-amber-900">
                      {user.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-amber-800">
                      {user.email || 'No email'}
                    </td>
                    <td className="py-3 px-4 text-amber-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={selectedRoles[user.id] || 'USER'}
                        onChange={(e) => handleRoleSelect(user.id, e.target.value)}
                        disabled={isProcessing === user.id}
                        className="text-xs rounded border border-amber-300 bg-white text-amber-900 focus:ring-2 focus:ring-amber-500 cursor-pointer px-2 py-1 outline-none disabled:opacity-50"
                      >
                        <option value="USER">User</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={isProcessing === user.id}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {isProcessing === user.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isProcessing === user.id || user.id === currentUserId}
                        className="text-amber-600 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.id === currentUserId ? "Cannot delete your own account" : "Reject and delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Users Section */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved Users ({approvedUsers.length})
          </h3>
        </div>
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
              {approvedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No approved users yet.
                  </td>
                </tr>
              ) : (
                approvedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {user.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {user.email || 'No email'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleApprove(user.id)}
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
    </div>
  )
}