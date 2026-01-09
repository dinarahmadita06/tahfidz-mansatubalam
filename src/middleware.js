import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper function to get dashboard URL based on role
function getDashboardUrl(userRole) {
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
      return '/siswa'; // Default to siswa dashboard
  }
}

export async function middleware(request) {
  // Try to get token with both v4 and v5 cookie names
  let token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const { pathname } = request.nextUrl;

  // Debug logging
// No log for performance


  // Additional debug for production
  if (process.env.NODE_ENV === 'production') {
    const cookies = request.cookies.getAll();
    console.log('🍪 [MIDDLEWARE] Cookies:', cookies.map(c => c.name).join(', '));
  }

  // Public routes yang tidak perlu auth
  const publicRoutes = ['/', '/register', '/lupa-password', '/reset-password', '/registrasi-orang-tua'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isAuthApiRoute = pathname.startsWith('/api/auth');
  const isSeedApiRoute = pathname === '/api/seed-tasmi' || pathname === '/api/seed-users';
  const isLoginPage = pathname === '/login';

  // Allow auth API routes and seed API route
  if (isAuthApiRoute || isSeedApiRoute) {
    return NextResponse.next();
  }

  // If user is already logged in and trying to access login page, redirect to their dashboard
  if (isLoginPage && token) {
    const dashboardUrl = getDashboardUrl(token.role);
// No log for performance

    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow login page for non-authenticated users
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Redirect ke login jika belum login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
// No log for performance

    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const role = token.role;

  // Admin routes
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    const redirectUrl = getDashboardUrl(role);
// No log for performance

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Guru routes
  if (pathname.startsWith('/guru') && role !== 'GURU') {
    const redirectUrl = getDashboardUrl(role);
// No log for performance

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Orangtua routes
  if (pathname.startsWith('/orangtua') && role !== 'ORANGTUA' && role !== 'ORANG_TUA') {
    const redirectUrl = getDashboardUrl(role);
// No log for performance

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Siswa routes
  if (pathname.startsWith('/siswa') && role !== 'SISWA') {
    const redirectUrl = getDashboardUrl(role);
// No log for performance

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Handle removed student presensi route
  if (pathname === '/siswa/presensi' && role === 'SISWA') {
// No log for performance

    return NextResponse.redirect(new URL('/siswa', request.url));
  }

  // Redirect root and /dashboard to role-specific dashboard
  if (pathname === '/' || pathname === '/dashboard') {
    const targetUrl = getDashboardUrl(role);
// No log for performance

    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

// No log for performance


  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};