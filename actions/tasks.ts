'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count += 1

  return true
}

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(1000).optional(),
  status: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  submissionLink: z.string().url('Invalid URL format').optional().or(z.literal('')),
})

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
  description: z.string().max(1000).optional(),
  submissionLink: z.string().url('Invalid URL format').optional().or(z.literal('')).optional(),
  submissionNotes: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
})

// --- Helper to get current user ---
async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session || !(session as any).user?.id) {
    return null
  }
  return {
    id: (session as any).user.id,
    role: (session as any).user.role || 'USER',
  }
}

export async function createTask(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role === 'USER') {
    return { error: 'Unauthorized. Only managers can create tasks.' }
  }

  if (!checkRateLimit(`createTask_${user.id}`, 10, 60000)) {
    return { error: 'Rate limit exceeded. Please try again later.' }
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    projectId: formData.get('projectId'),
    assigneeId: formData.get('assigneeId'),
    dueDate: formData.get('dueDate'),
    submissionLink: formData.get('submissionLink'),
  }

  const validated = createTaskSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.message }
  }

  try {
    await prisma.task.create({
      data: {
        title: validated.data.title.trim(),
        description: validated.data.description?.trim() || null,
        status: validated.data.status || 'TODO',
        projectId: validated.data.projectId,
        assigneeId: validated.data.assigneeId === '' ? null : validated.data.assigneeId || null,
        dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
        submissionLink: validated.data.submissionLink === '' ? null : validated.data.submissionLink || null,
      },
    })

    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to create task:', error)
    return { error: 'An unexpected error occurred.' }
  }
}

export async function updateTaskDetails(taskId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  if (!checkRateLimit(`updateTask_${user.id}`, 20, 60000)) {
    return { error: 'Rate limit exceeded.' }
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Task not found' }

  const isManager = user.role !== 'USER'
  const isAssignee = task.assigneeId === user.id

  if (!isManager && !isAssignee) {
    return { error: 'You do not have permission to edit this task.' }
  }

  const rawData = {
    title: isManager ? formData.get('title') : undefined,
    description: isManager ? formData.get('description') : undefined,
    submissionLink: isManager ? formData.get('submissionLink') : undefined,
    submissionNotes: formData.get('submissionNotes'),
    dueDate: isManager ? formData.get('dueDate') : undefined,
  }

  const validated = updateTaskSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.message }
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: validated.data.title?.trim() || undefined,
        description: validated.data.description?.trim() || null,
        submissionLink: validated.data.submissionLink === '' ? null : (validated.data.submissionLink || null),
        submissionNotes: validated.data.submissionNotes?.trim() || null,
        dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : undefined,
      },
    })

    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to update task details:', error)
    return { error: 'Failed to update task details.' }
  }
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Task not found' }

  const isManager = user.role !== 'USER'
  const isAssignee = task.assigneeId === user.id

  if (!isManager && !isAssignee) {
    return { error: 'You do not have permission to update this task.' }
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to update task status:', error)
    return { error: 'Failed to update task status.' }
  }
}

export async function updateTaskAssignee(taskId: string, newAssigneeId: string) {
  const user = await getCurrentUser()
  if (!user || user.role === 'USER') {
    return { error: 'Unauthorized. Only managers can reassign tasks.' }
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: newAssigneeId === '' ? null : newAssigneeId },
    })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to update assignee:', error)
    return { error: 'Failed to update assignee.' }
  }
}

export async function nudgeTask(taskId: string) {
  const user = await getCurrentUser()
  if (!user || user.role === 'USER') {
    return { error: 'Unauthorized. Only managers can nudge tasks.' }
  }

  if (!checkRateLimit(`nudgeTask_${user.id}`, 5, 60000)) {
    return { error: 'Rate limit exceeded. Please wait before nudging again.' }
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { nudgedAt: new Date() },
    })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to nudge task:', error)
    return { error: 'Failed to send nudge.' }
  }
}

export async function clearNudge(taskId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { nudgedAt: null },
    })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to clear nudge:', error)
    return { error: 'Failed to clear nudge.' }
  }
}

export async function deleteTask(taskId: string) {
  const user = await getCurrentUser()
  if (!user || user.role === 'USER') {
    return { error: 'Unauthorized. Only managers can delete tasks.' }
  }

  try {
    await prisma.task.delete({ where: { id: taskId } })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete task:', error)
    return { error: 'Failed to delete task.' }
  }
}

export async function deleteAllTasks() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Only Admins can delete all tasks.' }
  }

  try {
    await prisma.task.deleteMany({})
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete all tasks:', error)
    return { error: 'Failed to delete all tasks.' }
  }
}

export async function clearCompletedTasks() {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.task.deleteMany({
      where: { 
        status: 'DONE',
        assigneeId: user.id 
      },
    })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to clear completed tasks:', error)
    return { error: 'Failed to clear completed tasks.' }
  }
}


