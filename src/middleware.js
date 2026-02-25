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

  // Role-aware idle timeout enforcement + absolute expiration (use token fetched above)

  // Public routes and login bypass token check
  if (isPublicRoute || isLoginPage) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Absolute expiration: 7 days from iat (token issued time)
  const nowSec = Math.floor(Date.now() / 1000);
  const iat = token.iat || nowSec;
  const ABS_MAX_SEC = 7 * 24 * 60 * 60;
  const absExp = (iat + ABS_MAX_SEC);
  if (nowSec > absExp) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('reason', 'expired');
    const resp = NextResponse.redirect(loginUrl);
    // Best-effort: clear next-auth cookies
    const secure = process.env.NODE_ENV === 'production';
    resp.cookies.set('__Secure-next-auth.session-token', '', { httpOnly: true, sameSite: 'lax', secure, maxAge: 0, path: '/' });
    resp.cookies.set('next-auth.session-token', '', { httpOnly: true, sameSite: 'lax', secure, maxAge: 0, path: '/' });
    return resp;
  }

  // Idle timeout based on role
  const role = token.role;
  let idleMs = 60 * 60 * 1000; // default 60m
  if (role === 'ADMIN' || role === 'GURU') idleMs = 30 * 60 * 1000;
  if (role === 'SISWA' || role === 'ORANG_TUA' || role === 'ORANGTUA') idleMs = 2 * 60 * 60 * 1000;

  // Read last-activity cookie (httpOnly set by /api/auth/ping)
  const idleCookie = request.cookies.get('simtaq_idle_at');
  const lastActivity = idleCookie ? parseInt(idleCookie.value, 10) : Date.now();
  const nowMs = Date.now();

  // If cookie missing, initialize it
  if (!idleCookie) {
    const res = NextResponse.next();
    const secure = process.env.NODE_ENV === 'production';
    res.cookies.set('simtaq_idle_at', String(nowMs), {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
    return res;
  }

  if (nowMs - lastActivity > idleMs) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('reason', 'idle');
    const resp = NextResponse.redirect(loginUrl);
    const secure = process.env.NODE_ENV === 'production';
    // Clear session cookies
    resp.cookies.set('__Secure-next-auth.session-token', '', { httpOnly: true, sameSite: 'lax', secure, maxAge: 0, path: '/' });
    resp.cookies.set('next-auth.session-token', '', { httpOnly: true, sameSite: 'lax', secure, maxAge: 0, path: '/' });
    // Clear idle cookie
    resp.cookies.set('simtaq_idle_at', '', { httpOnly: true, sameSite: 'lax', secure, maxAge: 0, path: '/' });
    return resp;
  }

  // If user is already logged in and trying to access login page, redirect to their dashboard
  if (isLoginPage) {
    const dashboardUrl = getDashboardUrl(token.role);
// No log for performance

    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Role-based access control

  // Admin routes
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    const redirectUrl = getDashboardUrl(role);

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
