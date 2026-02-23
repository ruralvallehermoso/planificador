import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, completed } = body;

        // Verify ownership
        const existingItem = await prisma.shoppingItem.findUnique({
            where: { id }
        });

        if (!existingItem || existingItem.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        const item = await prisma.shoppingItem.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(completed !== undefined && { completed }),
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('[API/hogar/shopping/id] PUT error:', error);
        return NextResponse.json({ error: 'Failed to update shopping item' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existingItem = await prisma.shoppingItem.findUnique({
            where: { id }
        });

        if (!existingItem || existingItem.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        await prisma.shoppingItem.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API/hogar/shopping/id] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete shopping item' }, { status: 500 });
    }
}
