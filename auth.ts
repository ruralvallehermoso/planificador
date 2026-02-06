import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { verifyPassword, hashPassword } from './lib/auth/password'
import { prisma } from './lib/prisma'
import { authConfig } from './auth.config'
import type { Adapter } from 'next-auth/adapters'

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]) as Adapter,
    session: {
        strategy: 'jwt',
    },
    trustHost: true,
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

                const isValidPassword = await verifyPassword(
                    credentials.password as string,
                    user.passwordHash
                )

                if (!isValidPassword) {
                    return null
                }

                // Auto-migrate legacy bcrypt hashes to Argon2id
                if (user.passwordHash.startsWith('$2')) {
                    console.log(`[AUTH] Migrating user ${user.email} from Bcrypt to Argon2id...`)
                    const newHash = await hashPassword(credentials.password as string)
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { passwordHash: newHash }
                    })
                    console.log(`[AUTH] Migration successful for ${user.email}`)
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
})
