'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// GET /api/admin/users - List all users
export async function GET() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            canAccessCasaRural: true,
            canAccessFinanzas: true,
            canAccessFpInformatica: true,
            canAccessHogar: true,
            canAccessMasterUnie: true,
            defaultDashboard: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
}

// POST /api/admin/users - Create a new user
export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { email, password, name, role, canAccessCasaRural, canAccessFinanzas, canAccessFpInformatica, canAccessHogar, canAccessMasterUnie } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || null,
                role: role || 'GUEST',
                canAccessCasaRural: canAccessCasaRural || false,
                canAccessFinanzas: canAccessFinanzas || false,
                canAccessFpInformatica: canAccessFpInformatica || false,
                canAccessHogar: canAccessHogar || false,
                canAccessMasterUnie: canAccessMasterUnie || false,
                defaultDashboard: body.defaultDashboard || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                canAccessCasaRural: true,
                canAccessFinanzas: true,
                canAccessFpInformatica: true,
                canAccessHogar: true,
                canAccessMasterUnie: true,
                createdAt: true,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }
}
