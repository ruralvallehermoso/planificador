'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// GET /api/admin/users/[id] - Get a single user
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
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
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    try {
        const body = await request.json()
        const { email, password, name, role, canAccessCasaRural, canAccessFinanzas, canAccessFpInformatica, canAccessHogar, canAccessMasterUnie } = body

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { id } })
        if (!existingUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // If changing email, check it's not taken
        if (email && email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({ where: { email } })
            if (emailTaken) {
                return NextResponse.json({ error: 'El email ya está en uso' }, { status: 400 })
            }
        }

        // Build update data
        const updateData: any = {
            email: email || existingUser.email,
            name: name !== undefined ? name : existingUser.name,
            role: role || existingUser.role,
            canAccessCasaRural: canAccessCasaRural ?? existingUser.canAccessCasaRural,
            canAccessFinanzas: canAccessFinanzas ?? existingUser.canAccessFinanzas,
            canAccessFpInformatica: canAccessFpInformatica ?? existingUser.canAccessFpInformatica,
            canAccessHogar: canAccessHogar ?? existingUser.canAccessHogar,
            canAccessMasterUnie: canAccessMasterUnie ?? existingUser.canAccessMasterUnie,
            defaultDashboard: body.defaultDashboard !== undefined ? body.defaultDashboard : existingUser.defaultDashboard,
        }

        // Only update password if provided
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 12)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
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
                updatedAt: true,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
    }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    // Prevent deleting yourself
    if (id === session.user.id) {
        return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        await prisma.user.delete({ where: { id } })

        return NextResponse.json({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
    }
}
