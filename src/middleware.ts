import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    console.log('[MIDDLEWARE] Authorized user accessing:', req.nextUrl.pathname);
    console.log('[MIDDLEWARE] Token:', JSON.stringify(req.nextauth?.token));
    return NextResponse.next();
  },
  {
    pages: { signIn: '/login' },
    callbacks: {
      authorized({ token, req }) {
        console.log('[MIDDLEWARE] Checking auth for:', req.nextUrl.pathname);
        console.log('[MIDDLEWARE] Token exists:', !!token);
        console.log('[MIDDLEWARE] NEXTAUTH_SECRET set:', !!process.env.NEXTAUTH_SECRET);
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventory/:path*',
    '/leads/:path*',
    '/deals/:path*',
    '/suppliers/:path*',
    '/expenses/:path*',
    '/locations/:path*',
    '/users/:path*',
    '/reports/:path*',
  ],
};
