import { NextRequest, NextResponse } from "next/server";

const PLANIFICADOR_URL = process.env.NEXT_PUBLIC_PLANIFICADOR_URL || 'https://planificador-seven.vercel.app';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const url = `${PLANIFICADOR_URL}/api/tasks/${id}`;

        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy PATCH error:', error);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const url = `${PLANIFICADOR_URL}/api/tasks/${id}`;

        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // DELETE often returns 200/204 with no body or small body
        if (res.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy DELETE error:', error);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}
