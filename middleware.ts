import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import { getModuleFromPath, canAccessModule } from './lib/auth/permissions'

const isDev = process.env.NODE_ENV !== 'production';

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const path = nextUrl.pathname
    const user = req.auth?.user as any

    console.log('[MIDDLEWARE] Request:', {
        path,
        hasAuth: !!req.auth,
        hasUser: !!user,
        userEmail: user?.email
    });

    // CORS: only allow known origins
    const ALLOWED_ORIGINS = [
        process.env.NEXTAUTH_URL || 'https://planificador-chi.vercel.app',
        process.env.NEXT_PUBLIC_PORTFOLIO_URL?.replace(/\/$/, '') || 'https://finanzas-tau-ten.vercel.app',
        process.env.NEXT_PUBLIC_CASARURAL_URL || 'https://casa-rural-web-alpha.vercel.app',
        process.env.NEXT_PUBLIC_HOGAR_URL || 'https://hogar-web.vercel.app',
        process.env.NEXT_PUBLIC_FINANZAS_BACKEND_URL || 'https://backend-rho-two-p1x4gg922k.vercel.app',
        ...(isDev ? ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:5173'] : []),
    ];

    if (path.startsWith('/api/')) {
        const origin = req.headers.get('origin')
        const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    ...(isAllowedOrigin ? { 'Access-Control-Allow-Origin': origin } : {}),
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Max-Age': '86400',
                },
            })
        }

        // Bypass removed for /api/tasks to enforce authentication
    }

    // Skip auth check for login and API routes (auth) and webhooks
    const isPublicRoute = path.startsWith('/login') || path.startsWith('/api/auth') || path.startsWith('/api/webhooks') || path.startsWith('/api/inngest')
    if (isPublicRoute) {
        console.log('[MIDDLEWARE] Public route, allowing access');
        return NextResponse.next()
    }

    // FORCE redirect to login if no user
    if (!user) {
        console.log('[MIDDLEWARE] No user found, redirecting to /login');
        const loginUrl = new URL('/login', nextUrl.origin)
        loginUrl.searchParams.set('callbackUrl', nextUrl.href)
        return NextResponse.redirect(loginUrl)
    }

    // If we reach here and have a user, check module permissions
    // Check module-specific permissions
    const module = getModuleFromPath(path)
    if (module && !canAccessModule(user, module)) {
        console.log('[MIDDLEWARE] User lacks permission for module:', module);
        return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
    }

    // EMPLEADO role restrictions
    if (user.role === 'EMPLEADO' && path.startsWith('/casa-rural')) {
        const allowedPaths = ['/casa-rural', '/casa-rural/ses-hospedajes', '/casa-rural/actividades']
        const isAllowed = allowedPaths.some(p => path === p || path.startsWith(p + '/'))
        if (!isAllowed) {
            return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
        }
    }

    // Admin routes
    if (path.startsWith('/admin') && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
    }

    console.log('[MIDDLEWARE] User authenticated, allowing access');
    return NextResponse.next()
})

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
    ],
}

