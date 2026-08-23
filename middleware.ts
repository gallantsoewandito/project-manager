import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const requiresPasswordChange = token?.requiresPasswordChange
    const isChangePasswordPage = req.nextUrl.pathname === "/dashboard/settings/change-password"
    const isLoginPage = req.nextUrl.pathname === "/login"

    // If user needs password change and is not on the change password page
    if (requiresPasswordChange && !isChangePasswordPage && !isLoginPage) {
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
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}