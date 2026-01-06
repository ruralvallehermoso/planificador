import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import { getModuleFromPath, canAccessModule } from './lib/auth/permissions'

const { auth } = NextAuth(authConfig)

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth']

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const path = nextUrl.pathname

    // Allow public routes
    if (publicRoutes.some(route => path.startsWith(route))) {
        return NextResponse.next()
    }

    // Allow static files and API routes (except protected ones)
    if (path.startsWith('/_next') || path.startsWith('/favicon') || path.includes('.')) {
        return NextResponse.next()
    }

    // Redirect to login if not authenticated
    if (!isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl.origin)
        loginUrl.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(loginUrl)
    }

    // Check module-specific permissions
    const module = getModuleFromPath(path)
    if (module) {
        const user = req.auth?.user as any
        if (!canAccessModule(user, module)) {
            return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
        }
    }

    // EMPLEADO role restrictions - only SES Hospedajes and Actividades within Casa Rural
    const user = req.auth?.user as any
    if (user?.role === 'EMPLEADO' && path.startsWith('/casa-rural')) {
        const allowedPaths = ['/casa-rural', '/casa-rural/ses-hospedajes', '/casa-rural/actividades']
        const isAllowed = allowedPaths.some(p => path === p || path.startsWith(p + '/'))
        if (!isAllowed) {
            return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
        }
    }

    // Check admin routes - require ADMIN role
    if (path.startsWith('/admin')) {
        if (user?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
    ],
}
