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

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, priority, status, dueDate } = body;

        const task = await prisma.actionItem.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(priority !== undefined && { priority }),
                ...(status !== undefined && { status }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
            },
            include: { category: true }
        });

        return NextResponse.json(task, { headers: corsHeaders });
    } catch (error) {
        console.error('[API/tasks/id] PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500, headers: corsHeaders });
    }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.actionItem.delete({
            where: { id }
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('[API/tasks/id] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500, headers: corsHeaders });
    }
}
