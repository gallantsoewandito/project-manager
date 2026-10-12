'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createOrganization(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  const userId = (session.user as any).id
  const name = formData.get('name') as string

  if (!name || name.trim().length < 2) {
    return { error: 'Organization name must be at least 2 characters.' }
  }

  try {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    const org = await prisma.organization.create({
      data: {
        name: name.trim(),
        inviteCode,
        members: {
          create: {
            userId,
            role: 'ORG_ADMIN',
          },
        },
      },
    })

    return { success: true, organizationId: org.id }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'An organization with this name already exists.' }
    }
    console.error('Failed to create organization:', error)
    return { error: 'An unexpected error occurred.' }
  }
}

export async function joinOrganization(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  const userId = (session.user as any).id
  const inviteCode = formData.get('inviteCode') as string

  if (!inviteCode || inviteCode.trim().length === 0) {
    return { error: 'Invite code is required.' }
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    })

    if (!org) {
      return { error: 'Invalid invite code.' }
    }

    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId,
        },
      },
    })

    if (existingMembership) {
      return { error: 'You are already a member of this organization.' }
    }

    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId,
        role: 'ORG_MEMBER',
      },
    })

    return { success: true, organizationId: org.id }
  } catch (error) {
    console.error('Failed to join organization:', error)
    return { error: 'An unexpected error occurred.' }
  }
}