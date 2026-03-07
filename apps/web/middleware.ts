import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { redis } from './lib/redis'

export async function middleware(request: NextRequest) {
    // Basic Rate Limiting for API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
        const ratelimitKey = `ratelimit:${ip}`;

        try {
            const currentRequests = await redis.incr(ratelimitKey);
            if (currentRequests === 1) {
                await redis.expire(ratelimitKey, 60); // 1 minute window
            }

            if (currentRequests > 100) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    { status: 429 }
                );
            }
        } catch (e) {
            console.error('Redis Rate Limit Error:', e);
            // Fail open to avoid blocking users if Redis is down
        }
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
