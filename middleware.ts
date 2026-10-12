import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    if (!token) return NextResponse.next()

    const requiresPasswordChange = token.requiresPasswordChange as boolean
    const path = req.nextUrl.pathname
    const isChangePasswordPage = path === "/dashboard/settings/change-password"
    const isOnboardingPage = path === "/dashboard/onboarding"
    
    // 1. Force password change if required
    if (requiresPasswordChange && !isChangePasswordPage && !isOnboardingPage) {
      return NextResponse.redirect(new URL("/dashboard/settings/change-password", req.url))
    }

    // 2. Block access to change password if not required
    if (!requiresPasswordChange && isChangePasswordPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // 3. Enforce Organization Membership for Dashboard routes
    const hasOrganization = !!token.organizationId
    const isProtectedRoute = path.startsWith('/dashboard')

    if (isProtectedRoute && !hasOrganization && !isOnboardingPage && !isChangePasswordPage) {
      // Redirect users without an organization to the onboarding page
      return NextResponse.redirect(new URL("/dashboard/onboarding", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Always allow access to login and signup
        if (path === "/login" || path === "/signup" || path === "/dashboard/onboarding") {
          return true
        }
        
        // Require a valid token for all other matched routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}