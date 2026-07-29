import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientIdentifier, rateLimiters } from '@/lib/rate-limit';
import { init } from '@sentry/nextjs';

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  debug: false,
});

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const clientId = getClientIdentifier(request);

  // Only apply strict auth rate limiting to credential-based callbacks
  // to avoid blocking OAuth provider flows (Google, Apple, etc.).
  // NextAuth credential sign-ins hit: /api/auth/callback/credentials
  if (path.startsWith('/api/auth/callback/credentials') || path.startsWith('/api/auth/credentials')) {
    const result = await rateLimiters.auth(clientId, true);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many authentication attempts. Please try again later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': result.retryAfter?.toString() || '900',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
    return response;
  }

  // Allow other NextAuth routes (OAuth callbacks, sign-in pages) to proceed
  // without this strict auth rate limiter so OAuth flows are not blocked.
  if (path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (path.startsWith('/api/search/')) {
    const result = await rateLimiters.search(clientId, true);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many search requests. Please try again later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
    return response;
  }

  // General API rate limiting
  if (path.startsWith('/api/')) {
    // Exempt some user-driven endpoints from the generic API limiter to
    // avoid blocking normal interactive usage (adding/removing skills, etc.).
    // Keep strict limits for other API routes.
    if (path.startsWith('/api/skills')) {
      return NextResponse.next();
    }
    const result = await rateLimiters.api(clientId, true);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};

