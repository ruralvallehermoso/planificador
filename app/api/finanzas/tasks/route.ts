import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { canAccessModule } from '@/lib/auth/permissions'
import { MODULES } from '@/lib/auth/config'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        if (session.user.role !== 'ADMIN' && !canAccessModule(session.user, MODULES.FINANZAS)) {
            return NextResponse.json({ error: 'No tienes permiso para acceder a finanzas' }, { status: 403 })
        }

        const tasks = await prisma.finanzasTask.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(tasks)
    } catch (error) {
        console.error('[FINANZAS_TASKS_GET]', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(req: Request) {
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

        if (!title) {
            return NextResponse.json({ error: 'El título es requerido' }, { status: 400 })
        }

        const task = await prisma.finanzasTask.create({
            data: {
                title,
                status: status || 'PENDING',
                dueDate: dueDate ? new Date(dueDate) : null,
                userId: session.user.id
            }
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error('[FINANZAS_TASKS_POST]', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
