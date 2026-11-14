// proxy.js - Next 16 successor to middleware for route protection and RBAC
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-dev-secret');
const COOKIE_NAME = 'doodhwala-session';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      session = payload;
    } catch {
      session = null;
    }
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/plans' ||
    pathname === '/how-it-works' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/uploads');

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // redirect authenticated users away from /login & /register
  if (isAuthRoute && session) {
    const redirectUrl = session.role === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // protect dashboard routes
  if (isDashboardRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // protect admin routes
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;
