import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === 'development';
// Hardcoding production URL to rule out stale env vars
const PLANIFICADOR_URL = (isDev ? 'http://localhost:3000' : 'https://planificador-chi.vercel.app').replace(/\/$/, "");

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const url = `${PLANIFICADOR_URL}/api/tasks${queryString ? `?${queryString}` : ''}`;
        console.log(`Proxying GET to: ${url}`);

        const cookie = request.headers.get('cookie') || '';

        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            cache: 'no-store'
        });

        const contentType = res.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            console.error('Upstream non-JSON response:', text.slice(0, 500));
            // Include attempted URL for debugging
            return NextResponse.json({
                error: 'Upstream returned non-JSON',
                details: text.slice(0, 200),
                attemptedUrl: url
            }, { status: res.status === 200 ? 502 : res.status });
        }

        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Proxy GET error:', error);
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const url = `${PLANIFICADOR_URL}/api/tasks`;
        console.log(`Proxying POST to: ${url}`);

        const cookie = request.headers.get('cookie') || '';

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
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
            return NextResponse.json({ error: 'Upstream returned non-JSON', details: text.slice(0, 200) }, { status: res.status === 200 ? 502 : res.status });
        }

        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Proxy POST error:', error);
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 500 });
    }
}
