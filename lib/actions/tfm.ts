'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTFMItems() {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const items = await prisma.tFMItem.findMany({
            where: { userId: session.user.id },
            orderBy: { order: 'asc' }
        })
        return { success: true, items }
    } catch (error) {
        console.error("Error fetching TFM items:", error)
        return { success: false, error: "Failed to fetch items" }
    }
}

export async function createTFMItem(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string || "PENDING"
    const dateStr = formData.get('date') as string
    const date = dateStr ? new Date(dateStr) : null

    try {
        // Get max order
        const lastItem = await prisma.tFMItem.findFirst({
            where: { userId: session.user.id },
            orderBy: { order: 'desc' }
        })
        const order = (lastItem?.order ?? -1) + 1

        await prisma.tFMItem.create({
            data: {
                title,
                description,
                status,
                date,
                order,
                userId: session.user.id
            }
        })
        revalidatePath('/master-unie/tfm')
        return { success: true }
    } catch (e) {
        console.error("Error creating TFM item:", e)
        return { success: false, error: "Failed to create item" }
    }
}

export async function updateTFMItem(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const dateStr = formData.get('date') as string
    const date = dateStr ? new Date(dateStr) : null

    try {
        // Verify ownership
        const item = await prisma.tFMItem.findUnique({ where: { id } })
        if (!item || item.userId !== session.user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        await prisma.tFMItem.update({
            where: { id },
            data: {
                title,
                description,
                status,
                date
            }
        })
        revalidatePath('/master-unie/tfm')
        return { success: true }
    } catch (e) {
        console.error("Error updating TFM item:", e)
        return { success: false, error: "Failed to update item" }
    }
}

export async function deleteTFMItem(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        // Verify ownership
        const item = await prisma.tFMItem.findUnique({ where: { id } })
        if (!item || item.userId !== session.user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        await prisma.tFMItem.delete({
            where: { id }
        })
        revalidatePath('/master-unie/tfm')
        return { success: true }
    } catch (e) {
        console.error("Error deleting TFM item:", e)
        return { success: false, error: "Failed to delete item" }
    }
}

// ================== TFM CONFIG ==================

export async function getOrCreateTFMConfig() {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        let config = await prisma.tFMConfig.findUnique({
            where: { userId: session.user.id }
        })

        if (!config) {
            config = await prisma.tFMConfig.create({
                data: {
                    userId: session.user.id,
                    title: "",
                    tutor: "",
                    tutorInitials: "",
                    researchLine: "",
                    convocatoria: "Julio 2026"
                }
            })
        }
        return { success: true, config }
    } catch (error) {
        console.error("Error getting TFM config:", error)
        return { success: false, error: "Failed to get config" }
    }
}

export async function updateTFMConfig(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const title = formData.get('title') as string
    const tutor = formData.get('tutor') as string
    const tutorInitials = formData.get('tutorInitials') as string
    const researchLine = formData.get('researchLine') as string
    const convocatoria = formData.get('convocatoria') as string

    try {
        await prisma.tFMConfig.upsert({
            where: { userId: session.user.id },
            update: { title, tutor, tutorInitials, researchLine, convocatoria },
            create: {
                userId: session.user.id,
                title,
                tutor,
                tutorInitials,
                researchLine,
                convocatoria
            }
        })
        revalidatePath('/master-unie/tfm')
        return { success: true }
    } catch (e) {
        console.error("Error updating TFM config:", e)
        return { success: false, error: "Failed to update config" }
    }
}

// ================== TFM RESOURCES ==================

export async function getTFMResources() {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const resources = await prisma.tFMResource.findMany({
            where: { userId: session.user.id },
            orderBy: { order: 'asc' }
        })
        return { success: true, resources }
    } catch (error) {
        console.error("Error fetching TFM resources:", error)
        return { success: false, error: "Failed to fetch resources" }
    }
}

export async function createTFMResource(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const title = formData.get('title') as string
    const url = formData.get('url') as string

    try {
        const lastResource = await prisma.tFMResource.findFirst({
            where: { userId: session.user.id },
            orderBy: { order: 'desc' }
        })
        const order = (lastResource?.order ?? -1) + 1

        await prisma.tFMResource.create({
            data: {
                title,
                url,
                order,
                userId: session.user.id
            }
        })
        revalidatePath('/master-unie/tfm')
        return { success: true }
    } catch (e) {
        console.error("Error creating TFM resource:", e)
        return { success: false, error: "Failed to create resource" }
    }
}

export async function deleteTFMResource(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const resource = await prisma.tFMResource.findUnique({ where: { id } })
        if (!resource || resource.userId !== session.user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        await prisma.tFMResource.delete({ where: { id } })
        revalidatePath('/master-unie/tfm')
        return { success: true }
    } catch (e) {
        console.error("Error deleting TFM resource:", e)
        return { success: false, error: "Failed to delete resource" }
    }
}
