import { NextRequest, NextResponse } from "next/server";

const PLANIFICADOR_URL = process.env.NEXT_PUBLIC_PLANIFICADOR_URL || 'https://planificador-seven.vercel.app';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const url = `${PLANIFICADOR_URL}/api/tasks${queryString ? `?${queryString}` : ''}`;

        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                // Add auth token here if needed in future
            },
            cache: 'no-store'
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy GET error:', error);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const url = `${PLANIFICADOR_URL}/api/tasks`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy POST error:', error);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}
