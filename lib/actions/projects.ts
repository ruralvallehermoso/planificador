'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"

export async function getProjects(categoryId: string) {
    return prisma.project.findMany({
        where: { categoryId },
        include: {
            images: true,
            links: true
        },
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

export async function updateProject(projectId: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categorySlug = formData.get('categorySlug') as string

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                title,
                description,
            }
        })

        revalidatePath(`/${categorySlug}/projects`)
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to update project" }
    }
}

export async function deleteProject(projectId: string, categorySlug: string) {
    try {
        // Find project to get images and delete from disk if necessary
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { images: true }
        })

        if (project) {
            for (const image of project.images) {
                try {
                    // remove leading slash for local path resolution
                    const relativePath = image.url.startsWith('/') ? image.url.slice(1) : image.url
                    const filePath = join(process.cwd(), 'public', relativePath)
                    // Best effort to delete file
                    await unlink(filePath).catch(() => { })
                } catch (e) {
                    // ignore file deletion errors
                }
            }
        }

        await prisma.project.delete({
            where: { id: projectId }
        })

        revalidatePath(`/${categorySlug}/projects`)
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to delete project" }
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

export async function deleteProjectImage(imageId: string, categorySlug: string) {
    try {
        const image = await prisma.projectImage.findUnique({ where: { id: imageId } })
        if (image) {
            const relativePath = image.url.startsWith('/') ? image.url.slice(1) : image.url
            const filePath = join(process.cwd(), 'public', relativePath)
            await unlink(filePath).catch(() => { })

            await prisma.projectImage.delete({ where: { id: imageId } })
        }

        revalidatePath(`/${categorySlug}/projects`)
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to delete image" }
    }
}

export async function addProjectLink(formData: FormData) {
    const url = formData.get('url') as string
    const title = formData.get('title') as string
    const projectId = formData.get('projectId') as string
    const categorySlug = formData.get('categorySlug') as string

    try {
        await prisma.projectLink.create({
            data: {
                url,
                title,
                projectId
            }
        })
        revalidatePath(`/${categorySlug}/projects`)
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to add link" }
    }
}

export async function deleteProjectLink(linkId: string, categorySlug: string) {
    try {
        await prisma.projectLink.delete({ where: { id: linkId } })
        revalidatePath(`/${categorySlug}/projects`)
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to delete link" }
    }
}
