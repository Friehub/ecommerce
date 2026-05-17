import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isModeratorRoute = nextUrl.pathname.startsWith('/moderator');
  const isAgentRoute = nextUrl.pathname.startsWith('/apps/agent');
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isSellerRoute = nextUrl.pathname.startsWith('/seller');

  // Enforce session presence on gated routes
  if (isModeratorRoute || isAgentRoute || isAdminRoute || isSellerRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }

    // Enforce role-based prefix authorization
    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    if (isSellerRoute && role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    if (isModeratorRoute && role !== 'MODERATOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    if (isAgentRoute && role !== 'AGENT' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
