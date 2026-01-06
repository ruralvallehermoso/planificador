import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.canAccessCasaRural = (user as any).canAccessCasaRural
                token.canAccessFinanzas = (user as any).canAccessFinanzas
                token.canAccessFpInformatica = (user as any).canAccessFpInformatica
                token.canAccessHogar = (user as any).canAccessHogar
                token.canAccessMasterUnie = (user as any).canAccessMasterUnie
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.canAccessCasaRural = token.canAccessCasaRural as boolean
                session.user.canAccessFinanzas = token.canAccessFinanzas as boolean
                session.user.canAccessFpInformatica = token.canAccessFpInformatica as boolean
                session.user.canAccessHogar = token.canAccessHogar as boolean
                session.user.canAccessMasterUnie = token.canAccessMasterUnie as boolean
            }
            return session
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
