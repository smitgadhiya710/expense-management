import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true"
  const { pathname } = request.nextUrl

  // Check if target path is dashboard or subpath
  const isProtectedPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  // 1. If unauthenticated trying to access a protected path, redirect to login
  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url)
    // Keep track of the original page to redirect back after successful login
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. If authenticated trying to access login page, redirect to dashboard
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 3. Handle root route redirect
  if (pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - png/jpg/jpeg/svg (static asset files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)",
  ],
}
