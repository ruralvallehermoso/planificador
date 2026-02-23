import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const events = await prisma.homeEvent.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: { startDate: 'asc' }
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('[API/hogar/events] GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, startDate, endDate, eventType, color } = body;

        if (!title || !startDate) {
            return NextResponse.json({ error: 'Title and Start Date are required' }, { status: 400 });
        }

        const newEvent = await prisma.homeEvent.create({
            data: {
                userId: session.user.id,
                title,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                eventType: eventType || 'EVENT',
                color
            }
        });

        return NextResponse.json(newEvent, { status: 201 });
    } catch (error) {
        console.error('[API/hogar/events] POST error:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
