import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all local events
export async function GET(request: NextRequest) {
    try {
        const events = await prisma.event.findMany();
        // Map description -> desc for frontend compatibility if needed, 
        // OR frontend should adapt. 
        // Frontend uses 'desc', Schema uses 'description'.
        // Let's map it back for consistency.
        const mappedEvents = events.map(e => ({
            ...e,
            desc: e.description,
            // sourceId should assume 'local' if stored, but we store it as 'local' anyway.
        }));
        return NextResponse.json(mappedEvents);
    } catch (error) {
        console.error('Error fetching local events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

// POST: Create a new event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const event = await prisma.event.create({
            data: {
                title: body.title,
                start: new Date(body.start),
                end: new Date(body.end),
                allDay: body.allDay ?? false,
                description: body.desc, // Map desc -> description
                location: body.location,
                color: body.color,
                sourceId: 'local',
            }
        });
        return NextResponse.json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}

// PUT: Update an event
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const event = await prisma.event.update({
            where: { id: body.id },
            data: {
                title: body.title,
                start: new Date(body.start),
                end: new Date(body.end),
                allDay: body.allDay,
                description: body.desc, // Map desc -> description
                location: body.location,
                color: body.color,
            }
        });
        return NextResponse.json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

// DELETE: Delete an event
export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        await prisma.event.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
