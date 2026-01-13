import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

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
            } else {
                // If category doesn't exist, return empty list instead of error for smoother UX
                // or specifically handle it. For now, let's allow fetching empty.
                // But if filtering by category is strictly requested...
            }
        }

        const tasks = await prisma.actionItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { category: true }
        });

        return NextResponse.json(tasks, { headers: corsHeaders });
    } catch (error) {
        console.error('[API/tasks] GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500, headers: corsHeaders });
    }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, priority, categorySlug, dueDate, status } = body;

        if (!title || !categorySlug) {
            return NextResponse.json({ error: 'Title and category are required' }, { status: 400, headers: corsHeaders });
        }

        // Find or verify category exists
        let category = await prisma.category.findUnique({
            where: { slug: categorySlug }
        });

        // Auto-create category if it doesn't exist (specifically for 'hogar' fallback)
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
            return NextResponse.json({ error: 'Category not found' }, { status: 404, headers: corsHeaders });
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

        return NextResponse.json(task, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error('[API/tasks] POST error:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500, headers: corsHeaders });
    }
}
