/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            canAccessCasaRural: boolean
            canAccessFinanzas: boolean
            canAccessFpInformatica: boolean
            canAccessHogar: boolean
            canAccessMasterUnie: boolean
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role?: string
        canAccessCasaRural?: boolean
        canAccessFinanzas?: boolean
        canAccessFpInformatica?: boolean
        canAccessHogar?: boolean
        canAccessMasterUnie?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id?: string
        role?: string
        canAccessCasaRural?: boolean
        canAccessFinanzas?: boolean
        canAccessFpInformatica?: boolean
        canAccessHogar?: boolean
        canAccessMasterUnie?: boolean
    }
}
