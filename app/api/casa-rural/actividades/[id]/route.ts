'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// PUT /api/casa-rural/actividades/[id] - Update activity
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        const body = await request.json()
        const { title, description, category, date } = body

        const existing = await prisma.employeeActivity.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })
        }

        // Only creator or admin can edit
        if (existing.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'No tienes permiso para editar esta actividad' }, { status: 403 })
        }

        const activity = await prisma.employeeActivity.update({
            where: { id },
            data: {
                title: title || existing.title,
                description: description !== undefined ? description : existing.description,
                category: category || existing.category,
                date: date ? new Date(date) : existing.date,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return NextResponse.json(activity)
    } catch (error) {
        console.error('Error updating activity:', error)
        return NextResponse.json({ error: 'Error al actualizar actividad' }, { status: 500 })
    }
}

// DELETE /api/casa-rural/actividades/[id] - Delete activity
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        const existing = await prisma.employeeActivity.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })
        }

        // Only creator or admin can delete
        if (existing.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'No tienes permiso para eliminar esta actividad' }, { status: 403 })
        }

        await prisma.employeeActivity.delete({ where: { id } })

        return NextResponse.json({ message: 'Actividad eliminada correctamente' })
    } catch (error) {
        console.error('Error deleting activity:', error)
        return NextResponse.json({ error: 'Error al eliminar actividad' }, { status: 500 })
    }
}
