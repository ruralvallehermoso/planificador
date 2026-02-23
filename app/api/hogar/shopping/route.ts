import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const items = await prisma.shoppingItem.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('[API/hogar/shopping] GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch shopping items' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, completed } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const item = await prisma.shoppingItem.create({
            data: {
                userId: session.user.id,
                title,
                completed: completed ?? false,
            }
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('[API/hogar/shopping] POST error:', error);
        return NextResponse.json({ error: 'Failed to create shopping item' }, { status: 500 });
    }
}
