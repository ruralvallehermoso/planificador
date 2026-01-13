import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === 'development';
// Hardcoding production URL to rule out stale env vars
const PLANIFICADOR_URL = (isDev ? 'http://localhost:3000' : 'https://planificador-chi.vercel.app').replace(/\/$/, "");

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const url = `${PLANIFICADOR_URL}/api/tasks/${id}`;
        console.log(`Proxying PATCH to: ${url}`);

        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const contentType = res.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            console.error('Upstream non-JSON response:', text.slice(0, 500));
            return NextResponse.json({
                error: 'Upstream returned non-JSON',
                details: text.slice(0, 200),
                attemptedUrl: url
            }, { status: res.status === 200 ? 502 : res.status });
        }

        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Proxy PATCH error:', error);
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const url = `${PLANIFICADOR_URL}/api/tasks/${id}`;
        console.log(`Proxying DELETE to: ${url}`);

        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const contentType = res.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            console.error('Upstream non-JSON response:', text.slice(0, 500));
            return NextResponse.json({
                error: 'Upstream returned non-JSON',
                details: text.slice(0, 200),
                attemptedUrl: url
            }, { status: res.status === 200 ? 502 : res.status });
        }

        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Proxy DELETE error:', error);
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 500 });
    }
}
