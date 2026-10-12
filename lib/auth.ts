import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        if (!user.isApproved) {
          throw new Error('Your account is pending admin approval.')
        }

        // Cast to 'any' to include our custom properties
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          requiresPasswordChange: user.requiresPasswordChange,
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.requiresPasswordChange = (user as any).requiresPasswordChange
      }

      // Handle session updates (e.g., after password change)
      if (trigger === 'update' && session) {
        token.requiresPasswordChange = (session as any).requiresPasswordChange
      }

      // Fetch organization context for the user
      if (token.id) {
        const orgMembership = await prisma.organizationMember.findFirst({
          where: { userId: token.id as string },
          select: { organizationId: true, role: true }
        })

        if (orgMembership) {
          token.organizationId = orgMembership.organizationId
          token.orgRole = orgMembership.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).requiresPasswordChange = token.requiresPasswordChange
        ;(session.user as any).organizationId = token.organizationId
        ;(session.user as any).orgRole = token.orgRole
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}