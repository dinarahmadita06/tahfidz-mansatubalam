import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if not authenticated and trying to access protected route
  if (!session && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if authenticated and trying to access login/register
  if (session && isPublicRoute) {
    const role = session.user.role;
    const dashboardMap = {
      ADMIN: "/admin",
      GURU: "/guru",
      SISWA: "/dashboard",
      ORANG_TUA: "/orangtua",
    };
    return NextResponse.redirect(new URL(dashboardMap[role] || "/", request.url));
  }

  // Role-based access control
  if (session) {
    const role = session.user.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/guru") && role !== "GURU") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/dashboard") && role !== "SISWA") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/orangtua") && role !== "ORANG_TUA") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API routes - they handle auth internally)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
