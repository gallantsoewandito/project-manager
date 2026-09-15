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

const signUpSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least 1 uppercase letter and 1 digit'),
})

export async function requestSignup(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const validated = signUpSchema.safeParse({ name, email, password })
    if (!validated.success) {
        return { error: validated.error.message }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email }})
        if (existingUser) {
            return { error: 'An account with this email already exists.' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER',
                isApproved: false,
                requiresPasswordChange: false,
            },
        })

        return { success: true }
    } catch (error) {
        return { error: 'An unexpected error occured.'}
    }
}

export async function createUserByAdmin(formData: FormData) {
    const admin = await getAdminUser()
    if (!admin) return { error: 'Unauthorized. Only Admins can create users.' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!(name && email)) {
        return { error: 'All fields are required.' }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
        return { error: 'A user with this email already exists.' }
        }

        const hashedPassword = await bcrypt.hash('password123', 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER',
                isApproved: true,
                requiresPasswordChange: true,
            },
        })

        revalidatePath('/dashboard/settings/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to create user:', error)
        return { error: 'An unexpected error occurred.' }
    }
}

export async function approveUser(userId: string, newRole: string) {
    const admin = await getAdminUser()
    if (!admin) return { error: 'Unauthorized.' }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { 
                isApproved: true,
                role: newRole as any,
            },
        })
        revalidatePath('/dashboard/settings/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to approve user:', error)
        return { error: 'Failed to approve user.' }
    }
}

export async function checkApprovalStatus(email:string) {
  if (!email) {
    return { approved: false }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    return { approved: user?.isApproved || false }
  } catch (error) {
    return { approved: false }
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

export async function updateUserPassword(userId: string, newPassword: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session as any).user?.id !== userId) {
    return { error: 'Unauthorized.' }
  }

  const validated = signUpSchema.safeParse({ password: newPassword, name: 'temp', email: 'temp@test.com' })
  if (!validated.success) {
    return { error: validated.error.message }
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { id: userId },
        data: {
        password: hashedPassword,
        requiresPasswordChange: false,
        },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update password:', error)
    return { error: 'Failed to update password.' }
  }
}

export async function updateUserProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  const userId = (session.user as any).id
  const name = formData.get('name') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  try {
    const updateData: any = {
      name: name.trim(),
    }

    if (newPassword && newPassword.trim() !== '') {
      if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match.' }
      }

      const validated = signUpSchema.safeParse({
        password: newPassword, 
        name: 'temp', 
        email: 'temp@test.com'
      })

      if (!validated.success) {
        return { error: validated.error.message }
      }
      
      updateData.password = await bcrypt.hash(newPassword, 10)
      updateData.requiresPasswordChange = false
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { error: 'An unexpected error occurred.' }
  }
}