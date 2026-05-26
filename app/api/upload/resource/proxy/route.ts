import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(request: Request) {
    const session = await auth()
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 })
    }

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch from blob: ${response.statusText}`)
        }

        const buffer = await response.arrayBuffer()
        
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600',
            }
        })
    } catch (error) {
        console.error("Error proxying blob:", error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
