import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
        return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.name)
    const filename = `${uniqueSuffix}${ext}`
    const filepath = path.join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)
        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`
        })
    } catch (error) {
        console.error("Error creating file:", error)
        return NextResponse.json({ success: false, error: "Error saving file" }, { status: 500 })
    }
}
