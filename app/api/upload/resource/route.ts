import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const subjectId = formData.get('subjectId') as string

        if (!file || !subjectId) {
            return NextResponse.json({ error: 'Archivo y subjectId requeridos' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ]

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
        }

        // 20MB max
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ error: 'Archivo demasiado grande (máx 20MB)' }, { status: 400 })
        }

        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const blobPath = `recursos/${subjectId}/${cleanName}`

        const blob = await put(blobPath, file, {
            access: 'public',
            addRandomSuffix: true,
        })

        return NextResponse.json({
            url: blob.url,
            name: file.name,
            size: file.size,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
    }
}
