import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

// Remove or comment out the default export
// export default withMiddlewareAuthRequired({...})

// Instead, export an empty middleware function
export function middleware() {
  // Do nothing - this allows unauthenticated access to all routes
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}; 