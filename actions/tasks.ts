'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const projectId = formData.get('projectId') as string
    const assigneeId = formData.get('assigneeId') as string
    const dueDateStr = formData.get('dueDate') as string
    const submissionLink = formData.get('submissionLink') as string

    if (!title || title.trim().length === 0) {
        return { error: 'Task title is required.'}
    }

    try {
        await prisma.task.create({
            data: {
                title: title.trim(),
                description: description.trim() || null,
                status: status || 'TODO',
                projectId: projectId,
                assigneeId: assigneeId === '' ? null : assigneeId,
                dueDate: dueDateStr ? new Date(dueDateStr) : null,
                submissionLink: submissionLink.trim() || null,
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

export async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus },
        });
        revalidatePath('/dashboard/tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to update task status:', error);
        return { error: 'Failed to update status.' };
    }
}

export async function clearCompletedTasks() {
    try {
        prisma.task.deleteMany({
            where: { status: 'DONE'}
        });

        revalidatePath('/dashboard/tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to clear completed tasks:', error);
        return { error: 'Failed to clear tasks.' };
    }
}

export async function nudgeTask(taskId: string) {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { nudgedAt: new Date()},
        });

        revalidatePath('/dashboard/tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to nudge task:', error);
        return { error: 'Failed to send nudge.' };
    }
}

export async function clearNudge(taskId: string) {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { nudgedAt: null },
        });

        revalidatePath('/dashboard/tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to clear nudge:', error);
        return { error: 'Failed to clear nudge.' };
    }
}

export async function deleteTask(taskId: string) {
  try {
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error);
    return { error: 'Failed to delete task.' };
  }
}

export async function deleteAllTasks() {
  try {
    await prisma.task.deleteMany({});
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete all tasks:', error);
    return { error: 'Failed to delete all tasks.' };
  }
}

export async function updateTaskAssignee(taskId: string, assigneeId: string) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: assigneeId || null },
    });

    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Failed to update assignee:', error);
    return { error: 'Failed to update assignee.' };
  }
}

export async function updateTaskDetails(taskId: string, formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const submissionLink = formData.get('submissionLink') as string
  const submissionNotes = formData.get('submissionNotes') as string

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title.trim() || undefined,
        description: description.trim() || null,
        submissionLink: submissionLink.trim() || null,
        submissionNotes: submissionNotes.trim() || null,
      },
    })

    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to update task details:', error)
    return { error: 'Failed to update task details.' }
  }
}