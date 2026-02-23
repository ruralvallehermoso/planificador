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
        const { title, description, startDate, endDate, eventType, color } = body;

        // Verify ownership
        const existingEvent = await prisma.homeEvent.findUnique({
            where: { id }
        });

        if (!existingEvent || existingEvent.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        const evt = await prisma.homeEvent.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(startDate !== undefined && { startDate: new Date(startDate) }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                ...(eventType !== undefined && { eventType }),
                ...(color !== undefined && { color }),
            }
        });

        return NextResponse.json(evt);
    } catch (error) {
        console.error('[API/hogar/events/id] PUT error:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
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
        const existingEvent = await prisma.homeEvent.findUnique({
            where: { id }
        });

        if (!existingEvent || existingEvent.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        await prisma.homeEvent.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API/hogar/events/id] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
