import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const SELLER_AUTH_ROUTES = ['/seller/login', '/seller/register'];
const ADMIN_AUTH_ROUTES = ['/admin/login'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Classify the route
  const isSellerAuthRoute = SELLER_AUTH_ROUTES.includes(nextUrl.pathname);
  const isAdminAuthRoute = ADMIN_AUTH_ROUTES.includes(nextUrl.pathname);
  const isBuyerAuthRoute = 
    nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

  const isSellerRoute = 
    nextUrl.pathname.startsWith('/seller') && !isSellerAuthRoute;

  const isAdminRoute = 
    nextUrl.pathname.startsWith('/admin') || 
    nextUrl.pathname === '/dashboard' || 
    nextUrl.pathname.startsWith('/fraud') || 
    nextUrl.pathname.startsWith('/inventory') || 
    nextUrl.pathname.startsWith('/logistics') || 
    nextUrl.pathname.startsWith('/payouts') || 
    nextUrl.pathname.startsWith('/sellers');

  const isModeratorRoute = nextUrl.pathname.startsWith('/moderator');

  // ---- Seller routes ----
  if (isSellerRoute) {
    if (!isLoggedIn) {
      const url = new URL('/seller/login', nextUrl.origin);
      url.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
  }

  // ---- Admin routes ----
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const url = new URL('/login', nextUrl.origin); // Use main login for admin or create /admin/login
      url.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
  }

  // ---- Moderator routes ----
  if (isModeratorRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl.origin));
    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
  }

  // ---- Auth pages: redirect away if already logged in ----
  const isAnyAuthRoute = isBuyerAuthRoute || isSellerAuthRoute || isAdminAuthRoute;
  if (isAnyAuthRoute && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, nextUrl.origin));
    }

    // Role-aware default redirect
    if (role === 'SELLER') return NextResponse.redirect(new URL('/seller/dashboard', nextUrl.origin));
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  return NextResponse.next();
});

// Optionally, don't run middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

