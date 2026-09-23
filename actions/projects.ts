'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function checkProjectPermission(projectId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const userId = (session.user as any).id
  const userRole = (session.user as any).role

  if (userRole === 'ADMIN' || userRole === 'MANAGER') return true

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (project?.creatorId === userId) return true

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } }
  })
  return membership?.role === 'MANAGER'
}

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  const userId = (session.user as any).id
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const membersJson = formData.get('members') as string

  if (!name || name.trim().length === 0) {
    return { error: 'Project name is required.' }
  }

  let invitedMembers: { userId: string; role: string }[] = []
  if (membersJson) {
    try {
      invitedMembers = JSON.parse(membersJson)
    } catch (error) {
      console.error('Failed to parse members JSON:', error)
    }
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        creatorId: userId,
        members: {
          create: [
            {
              userId: userId,
              role: 'MANAGER',
            },
            ...invitedMembers.map((member) => ({
              userId: member.userId,
              role: member.role,
            })),
          ],
        },
      },
    })

    revalidatePath('/dashboard/projects')
    return { success: true, id: project.id }
  } catch (error) {
    console.error('Failed to create project:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function deleteProject(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  const userId = (session.user as any).id
  const userRole = (session.user as any).role
  const projectId = formData.get('projectId') as string

  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) return { error: 'Project not found' }

  const isSystemManager = userRole === 'ADMIN' || userRole === 'MANAGER'
  const isCreator = project.creatorId === userId

  if (!isSystemManager && !isCreator) {
    return { error: 'Unauthorized. You do not have permission to delete this project.' }
  }

  try {
    await prisma.project.delete({ where: { id: projectId } })
    revalidatePath('/dashboard/projects')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete project:', error)
    return { error: 'An unexpected error occurred.' }
  }
}

// --- Add Member ---
export async function addProjectMember(projectId: string, userId: string) {
  if (!(await checkProjectPermission(projectId))) {
    return { error: 'Unauthorized. You do not have permission to add members.' }
  }

  try {
    await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: 'MEMBER',
      },
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { error: 'Failed to add member.' }
  }
}

// --- Remove Member ---
export async function removeProjectMember(projectId: string, userId: string) {
  if (!(await checkProjectPermission(projectId))) {
    return { error: 'Unauthorized. You do not have permission to remove members.' }
  }

  try {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { error: 'Failed to remove member.' }
  }
}

// --- Update Member Role ---
export async function updateProjectMemberRole(projectId: string, userId: string, newRole: string) {
  if (!(await checkProjectPermission(projectId))) {
    return { error: 'Unauthorized. You do not have permission to change roles.' }
  }

  try {
    await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role: newRole },
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { error: 'Failed to update role.' }
  }
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await deleteProject(formData)
}