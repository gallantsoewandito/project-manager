'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs' 

async function getAdminUser() {
  const session = await getServerSession(authOptions)
  if (!session || (session as any).user?.role !== 'ADMIN') {
    return null
  }
  return { id: (session as any).user.id }
}

const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'MANAGER', 'ADMIN']),
})

export async function createUser(formData: FormData) {
    const admin = await getAdminUser()
    if (!admin) return { error: 'Unauthorized. Only Admins can create users.' }

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
    }

    const validated = createUserSchema.safeParse(rawData)
    if (!validated.success) {
        return { error: validated.error.message }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.data.email },
        })
        if (existingUser) {
        return { error: 'A user with this email already exists.' }
        }

        const hashedPassword = await bcrypt.hash(validated.data.password, 10)

        await prisma.user.create({
            data: {
                name: validated.data.name as any,
                email: validated.data.email as any,
                password: hashedPassword as any,
                role: validated.data.role as any,
            },
        })

        revalidatePath('/dashboard/settings/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to create user:', error)
        return { error: 'An unexpected error occurred.' }
    }
}

export async function updateUserRole(userId: string, newRole: string) {
    const admin = await getAdminUser()
    if (!admin) return { error: 'Unauthorized. Only Admins can create users.' }

    if (userId === admin.id) {
        return { error: 'You cannot change your own role.' }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole as any },
        })

        revalidatePath('/dashboard/settings/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to update role:', error)
        return { error: 'Failed to update role.' }
    }
}

export async function deleteUser(userId: string) {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  if (userId === admin.id) {
    return { error: 'You cannot delete your own account.' }
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
    revalidatePath('/dashboard/settings/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return { error: 'Failed to delete user.' }
  }
}