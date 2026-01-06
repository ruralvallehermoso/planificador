import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import { getModuleFromPath, canAccessModule } from './lib/auth/permissions'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const path = nextUrl.pathname
    const user = req.auth?.user as any

    // Public routes handled by authConfig.callbacks.authorized
    // Static files excluded by matcher

    // If we reach here and have a user, check module permissions
    if (user) {
        // Check module-specific permissions
        const module = getModuleFromPath(path)
        if (module && !canAccessModule(user, module)) {
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
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
    ],
}

