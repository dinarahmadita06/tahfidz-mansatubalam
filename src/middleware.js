import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  });

  const { pathname } = request.nextUrl;

  // Public routes yang tidak perlu auth
  const publicRoutes = ['/login', '/register', '/api/auth'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect ke login jika belum login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const role = token.role;

  // Debug logging
  console.log('🔍 Middleware - Path:', pathname, '| Role:', role);

  // Helper function to get dashboard URL based on role
  const getDashboardUrl = (userRole) => {
    switch (userRole) {
      case 'ADMIN':
        return '/admin';
      case 'GURU':
        return '/guru';
      case 'ORANGTUA':
      case 'ORANG_TUA': // Support underscore format
        return '/orangtua';
      case 'SISWA':
        return '/siswa';
      default:
        return '/dashboard';
    }
  };

  // Admin routes
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
  }

  // Guru routes
  if (pathname.startsWith('/guru') && role !== 'GURU') {
    return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
  }

  // Orangtua routes
  if (pathname.startsWith('/orangtua') && role !== 'ORANGTUA' && role !== 'ORANG_TUA') {
    return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
  }

  // Siswa routes
  if (pathname.startsWith('/siswa') && role !== 'SISWA') {
    return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
  }

  // Redirect root and /dashboard to role-specific dashboard
  if (pathname === '/' || pathname === '/dashboard') {
    const targetUrl = getDashboardUrl(role);
    console.log('🔄 Redirecting from', pathname, 'to', targetUrl, '(Role:', role + ')');
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};