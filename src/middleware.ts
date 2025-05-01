import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { CustomUser } from "./app/api/auth/[...nextauth]/options";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to /login without authentication
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Protect all routes starting with /admin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL(
          "/login?error=Please login first to access this route",
          request.url
        )
      );
    }
    // Get user from token
    const user: CustomUser | null = token?.user as CustomUser;
    // If user is not an Admin, redirect to login
    if (user.role !== "Admin") {
      return NextResponse.redirect(
        new URL(
          "/login?error=You do not have permission to access this route.",
          request.url
        )
      );
    }
  }

  // * Protected routes for user
  const userProtectedRoutes = [""];
  // Check for user protected routes
  if (userProtectedRoutes.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(
        new URL(
          "/login?error=Please login first to access this route",
          request.url
        )
      );
    }
    // Get user from token
    const user: CustomUser | null = token?.user as CustomUser;
    // If Admin tries to access user routes
    if (user.role === "Admin") {
      return NextResponse.redirect(
        new URL(
          "/login?error=Please login as a user to access this route.",
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}