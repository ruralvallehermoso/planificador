import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import { getModuleFromPath, canAccessModule } from './lib/auth/permissions'

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

    // Allow CORS for API routes
    if (path.startsWith('/api/')) {
        const origin = req.headers.get('origin')

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': origin || '*',
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

