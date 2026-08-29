'use client'

import { useState } from 'react'
import { addProjectMember, removeProjectMember, updateProjectMemberRole } from '@/actions/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, UserPlus } from 'lucide-react'

interface Member {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface AvailableUser {
  id: string
  name: string | null
  email: string
}

interface ProjectMembersManagerProps {
  projectId: string
  members: Member[]
  availableUsers: AvailableUser[]
  currentUserId: string
}

export function ProjectMembersManager({ projectId, members, availableUsers, currentUserId }: ProjectMembersManagerProps) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAdd = async () => {
    if (!selectedUserId) return
    setIsProcessing(true)
    const result = await addProjectMember(projectId, selectedUserId)
    setIsProcessing(false)

    if (result?.error) {
      alert(result.error)
      return
    }

    setSelectedUserId('')
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the project?')) return
    setIsProcessing(true)
    const result = await removeProjectMember(projectId, userId)
    setIsProcessing(false)

    if (result?.error) {
      alert(result.error)
      return
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsProcessing(true)
    const result = await updateProjectMemberRole(projectId, userId, newRole)
    setIsProcessing(false)

    if (result?.error) {
      alert(result.error)
      return
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Member Section */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Add Members</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Select a user...</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleAdd} disabled={!selectedUserId || isProcessing} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Members List */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Name</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No members added yet.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {member.user.name || 'Unnamed User'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{member.user.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                      disabled={isProcessing}
                      className="text-xs rounded border border-slate-200 bg-white px-2 py-1 focus:ring-0 outline-none cursor-pointer"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleRemove(member.user.id)}
                      disabled={isProcessing || member.user.id === currentUserId}
                      className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove member"
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