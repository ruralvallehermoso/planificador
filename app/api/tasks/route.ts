import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tasks?category=hogar - Get all tasks for a category
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const categorySlug = searchParams.get('category');

        const where: any = {};

        if (categorySlug) {
            const category = await prisma.category.findUnique({
                where: { slug: categorySlug }
            });
            if (category) {
                where.categoryId = category.id;
            }
        }

        // Auto-create category if it doesn't exist and we are strictly asking for it? 
        // Usually GET doesn't create. Let's keep it simple.

        const tasks = await prisma.actionItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { category: true }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('[API/tasks] GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, priority, categorySlug, dueDate, status } = body;

        if (!title || !categorySlug) {
            return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
        }

        // Find or verify category exists
        let category = await prisma.category.findUnique({
            where: { slug: categorySlug }
        });

        // Auto-create category if it doesn't exist
        if (!category && categorySlug === 'hogar') {
            try {
                category = await prisma.category.create({
                    data: {
                        name: 'Hogar',
                        slug: 'hogar',
                        color: '#ec4899',
                        icon: 'HomeIcon',
                        description: 'Calendario y tareas del hogar'
                    }
                });
            } catch (e) {
                // Concurrency or other issue
            }
        }

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const task = await prisma.actionItem.create({
            data: {
                title,
                description: description || null,
                priority: priority || 'MEDIUM',
                status: status || 'TODO',
                dueDate: dueDate ? new Date(dueDate) : null,
                categoryId: category.id
            },
            include: { category: true }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('[API/tasks] POST error:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
