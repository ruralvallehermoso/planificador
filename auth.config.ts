import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname.startsWith('/login')
            const isOnApiAuth = nextUrl.pathname.startsWith('/api/auth')

            // Allow access to login and auth API routes
            if (isOnLogin || isOnApiAuth) {
                return true
            }

            // Redirect to login if not logged in
            if (!isLoggedIn) {
                return false // Will redirect to signIn page
            }

            return true
        },
        async jwt({ token, user }) {
            console.log('[AUTH DEBUG] JWT callback - user:', JSON.stringify(user));
            console.log('[AUTH DEBUG] JWT callback - token before:', JSON.stringify(token));

            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.canAccessCasaRural = (user as any).canAccessCasaRural ?? false
                token.canAccessFinanzas = (user as any).canAccessFinanzas ?? false
                token.canAccessFpInformatica = (user as any).canAccessFpInformatica ?? false
                token.canAccessHogar = (user as any).canAccessHogar ?? false
                token.canAccessMasterUnie = (user as any).canAccessMasterUnie ?? false
            }

            console.log('[AUTH DEBUG] JWT callback - token after:', JSON.stringify(token));
            return token
        },
        async session({ session, token }) {
            console.log('[AUTH DEBUG] Session callback - token:', JSON.stringify(token));

            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.canAccessCasaRural = (token.canAccessCasaRural as boolean) ?? false
                session.user.canAccessFinanzas = (token.canAccessFinanzas as boolean) ?? false
                session.user.canAccessFpInformatica = (token.canAccessFpInformatica as boolean) ?? false
                session.user.canAccessHogar = (token.canAccessHogar as boolean) ?? false
                session.user.canAccessMasterUnie = (token.canAccessMasterUnie as boolean) ?? false
            }

            console.log('[AUTH DEBUG] Session callback - session.user:', JSON.stringify(session.user));
            return session
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig

