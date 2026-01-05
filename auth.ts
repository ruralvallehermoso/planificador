import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma'
import type { Adapter } from 'next-auth/adapters'

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]) as Adapter,
    session: {
        strategy: 'jwt',
    },
    trustHost: true, // Required for Vercel deployment
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user || !user.passwordHash) {
                    return null
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                )

                if (!isValidPassword) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    canAccessCasaRural: user.canAccessCasaRural,
                    canAccessFinanzas: user.canAccessFinanzas,
                    canAccessFpInformatica: user.canAccessFpInformatica,
                    canAccessHogar: user.canAccessHogar,
                    canAccessMasterUnie: user.canAccessMasterUnie,
                }
            },
        }),
    ],
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
})
