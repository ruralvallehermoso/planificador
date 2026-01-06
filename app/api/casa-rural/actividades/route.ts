'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/casa-rural/actividades - List activities
export async function GET(request: Request) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (category && category !== 'all') {
        where.category = category
    }

    if (startDate) {
        where.date = { ...where.date, gte: new Date(startDate) }
    }

    if (endDate) {
        where.date = { ...where.date, lte: new Date(endDate) }
    }

    const activities = await prisma.employeeActivity.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    })

    return NextResponse.json(activities)
}

// POST /api/casa-rural/actividades - Create activity
export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { title, description, category, date } = body

        if (!title || !category) {
            return NextResponse.json({ error: 'Título y categoría son requeridos' }, { status: 400 })
        }

        const activity = await prisma.employeeActivity.create({
            data: {
                title,
                description: description || null,
                category,
                date: date ? new Date(date) : new Date(),
                userId: session.user.id,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return NextResponse.json(activity, { status: 201 })
    } catch (error) {
        console.error('Error creating activity:', error)
        return NextResponse.json({ error: 'Error al crear actividad' }, { status: 500 })
    }
}
