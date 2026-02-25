import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
        }

        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const blobPath = `ProyectoIntermodular/${Date.now()}_${cleanName}`

        const blob = await put(blobPath, file, {
            access: 'public',
        })

        return NextResponse.json({ url: blob.url })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
    }
}
