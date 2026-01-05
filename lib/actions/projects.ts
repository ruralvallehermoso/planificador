'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function getProjects(categoryId: string) {
    return prisma.project.findMany({
        where: { categoryId },
        include: { images: true },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function createProject(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categorySlug = formData.get('categorySlug') as string

    // Resolve slug to ID
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) return { success: false, error: "Category not found" }

    try {
        const project = await prisma.project.create({
            data: {
                title,
                description,
                categoryId: category.id,
                status: "PLANNING"
            }
        })

        revalidatePath(`/${categorySlug}/projects`)
        return { success: true, data: project }
    } catch (e) {
        return { success: false, error: "Failed to create project" }
    }
}

export async function uploadProjectImage(formData: FormData) {
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const categorySlug = formData.get('categorySlug') as string

    if (!file) return { success: false, error: "No file uploaded" }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/uploads
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`
    const path = join(process.cwd(), 'public/uploads', filename)

    try {
        await writeFile(path, buffer)
        const url = `/uploads/${filename}`

        await prisma.projectImage.create({
            data: {
                url,
                projectId
            }
        })

        revalidatePath(`/${categorySlug}/projects`)
        return { success: true, url }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Failed to upload image" }
    }
}
