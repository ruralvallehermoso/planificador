import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { canAccessModule } from '@/lib/auth/permissions'
import { MODULES } from '@/lib/auth/config'

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        if (session.user.role !== 'ADMIN' && !canAccessModule(session.user, MODULES.FINANZAS)) {
            return NextResponse.json({ error: 'No tienes permiso para acceder a finanzas' }, { status: 403 })
        }

        const json = await req.json()
        const { title, status, dueDate } = json
        const { id } = await params

        const currentTask = await prisma.finanzasTask.findUnique({
            where: { id }
        })

        if (!currentTask) {
            return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
        }

        if (currentTask.userId !== session.user.id) {
            return NextResponse.json({ error: 'No autorizado para editar esta tarea' }, { status: 403 })
        }

        const task = await prisma.finanzasTask.update({
            where: { id },
            data: {
                title: title !== undefined ? title : undefined,
                status: status !== undefined ? status : undefined,
                dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
            }
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error('[FINANZAS_TASK_PUT]', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        if (session.user.role !== 'ADMIN' && !canAccessModule(session.user, MODULES.FINANZAS)) {
            return NextResponse.json({ error: 'No tienes permiso para acceder a finanzas' }, { status: 403 })
        }

        const { id } = await params

        const currentTask = await prisma.finanzasTask.findUnique({
            where: { id }
        })

        if (!currentTask) {
            return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
        }

        if (currentTask.userId !== session.user.id) {
            return NextResponse.json({ error: 'No autorizado para eliminar esta tarea' }, { status: 403 })
        }

        await prisma.finanzasTask.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[FINANZAS_TASK_DELETE]', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
