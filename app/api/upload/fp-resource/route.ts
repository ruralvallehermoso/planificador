import { put } from '@vercel/blob'
import { NextResponse } from 'next/ NextResponse'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request): Promise<NextResponse> {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename') || 'resource'
    const type = searchParams.get('type') || 'pdf'

    try {
        if (!request.body) {
            return NextResponse.json({ error: 'Cuerpo vacío' }, { status: 400 })
        }
        const blob = await put(`fp-resources/${filename}`, request.body, {
            access: 'public',
        })

        const resource = await prisma.fpExamResource.create({
            data: {
                name: filename,
                type: type,
                url: blob.url,
                size: 0, // We could pass this via headers if needed, but not strictly required
            }
        })

        return NextResponse.json({ success: true, blob, resource })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: 'Error interno en servidor' }, { status: 500 })
    }
}
