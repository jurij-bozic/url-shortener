import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/links/:path*'],
};
