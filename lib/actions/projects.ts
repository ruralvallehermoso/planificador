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

import { auth } from "@/auth"

export async function createProject(formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const members = formData.get('members') as string || ''
    const notes = formData.get('notes') as string || ''
    const categorySlug = formData.get('categorySlug') as string

    const technologies = formData.get('technologies') as string
    const coverImage = formData.get('coverImage') as string || '' // URL from client upload

    // Resolve slug to ID
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) return { success: false, error: "Category not found" }

    try {
        const project = await prisma.project.create({
            data: {
                title,
                description,
                members,
                notes,
                technologies,
                coverImage,
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
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const members = formData.get('members') as string || ''
    const notes = formData.get('notes') as string || ''
    const categorySlug = formData.get('categorySlug') as string

    const technologies = formData.get('technologies') as string
    const coverImage = formData.get('coverImage') as string || ''

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                title,
                description,
                members,
                notes,
                technologies,
                coverImage,
            }
        })

        revalidatePath(`/${categorySlug}/projects`)
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to update project" }
    }
}

export async function deleteProject(projectId: string, categorySlug: string) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }
    try {
        // Find project to get images and delete from disk if necessary
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { images: true }
        })

        if (project) {
            for (const image of project.images) {
                try {
                    if (image.url.includes('blob.vercel-storage.com')) {
                        const { del } = await import('@vercel/blob')
                        await del(image.url).catch(() => { })
                    } else {
                        // remove leading slash for local path resolution
                        const relativePath = image.url.startsWith('/') ? image.url.slice(1) : image.url
                        const filePath = join(process.cwd(), 'public', relativePath)
                        // Best effort to delete file
                        await unlink(filePath).catch(() => { })
                    }
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

    try {
        const { put } = await import('@vercel/blob')
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const blobPath = `ProyectoIntermodular/${Date.now()}_${cleanName}`
        const blob = await put(blobPath, file, { access: 'public' })
        const url = blob.url

        // Only create DB record if we have a projectId (i.e. we are editing, or associating with gallery)
        if (projectId) {
            await prisma.projectImage.create({
                data: {
                    url,
                    projectId
                }
            })
        }

        if (categorySlug) {
            revalidatePath(`/${categorySlug}/projects`)
        }
        return { success: true, url, id: projectId ? (await prisma.projectImage.findFirst({ where: { url } }))?.id : undefined }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Failed to upload image" }
    }
}

export async function deleteProjectImage(imageId: string, categorySlug: string) {
    try {
        const image = await prisma.projectImage.findUnique({ where: { id: imageId } })
        if (image) {
            if (image.url.includes('blob.vercel-storage.com')) {
                const { del } = await import('@vercel/blob')
                await del(image.url).catch(() => { })
            } else {
                const relativePath = image.url.startsWith('/') ? image.url.slice(1) : image.url
                const filePath = join(process.cwd(), 'public', relativePath)
                await unlink(filePath).catch(() => { })
            }

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
        revalidatePath(`/${categorySlug}/projects`)
        return { success: true, data: await prisma.projectLink.findFirst({ orderBy: { id: 'desc' }, where: { url, projectId } }) }
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
