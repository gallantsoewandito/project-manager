'use server'

import { Resend } from 'resend'
import { randomBytes } from 'crypto'
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

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createUser(formData: FormData) {
    const admin = await getAdminUser()
    if (!admin) return { error: 'Unauthorized. Only Admins can create users.' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string

    if (!(name && email && role)) {
        return { error: 'All fields are required.' }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
        return { error: 'A user with this email already exists.' }
        }

        const token = randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        await prisma.user.create({
            data: {
                name,
                email,
                role: role as any,
                inviteToken: token,
                inviteTokenExpires: expires,
            },
        })

        const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [email],
            subject: 'You have been invited to ProjectHub',
            html: `
                <h2>Welcome to ProjectHub</h2>
                <p>You have been invited to join the platform. Please click the link below to set your password and activate your account.</p>
                <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set Password</a>
                <p>This link will expire in 24 hours.</p>
            `,
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

export async function setPassword(token: string, password: string) {
  if (!token || !password) {
    return { error: 'Invalid request.' }
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  })

  if (!user) {
    return { error: 'Invalid or expired invitation link.' }
  }

  if (user.inviteTokenExpires && user.inviteTokenExpires < new Date()) {
    return { error: 'This invitation link has expired. Please contact your administrator.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      inviteToken: null,
      inviteTokenExpires: null,
    },
  })

  return { success: true }
}