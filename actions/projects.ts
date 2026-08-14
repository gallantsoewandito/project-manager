'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name || name.trim().length === 0) {
        return { error: 'Project name is required.' };
    }

    try {
        const project = await prisma.project.create({
            data: {
                name: name.trim(),
                description: description.trim() || null,
            },
        })

        revalidatePath('/dashboard/projects');
        return { success: true, id: project.id }
    } catch (error) {
        console.error('Failed to create project:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}