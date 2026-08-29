import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    if (!token) return NextResponse.next()

    const requiresPasswordChange = token.requiresPasswordChange as boolean
    const isChangePasswordPage = req.nextUrl.pathname === "/dashboard/settings/change-password"
    
    // If user needs password change and is not on the change password page
    if (requiresPasswordChange && !isChangePasswordPage) {
      return NextResponse.redirect(new URL("/dashboard/settings/change-password", req.url))
    }

    // If user doesn't need password change but is on the change password page
    if (!requiresPasswordChange && isChangePasswordPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // 1. Always allow access to login and signup pages to prevent redirect loops
        if (path === "/login" || path === "/signup") {
          return true
        }
        
        // 2. Require a valid token for all other matched routes (like /dashboard)
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}