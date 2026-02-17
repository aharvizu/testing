import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

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
