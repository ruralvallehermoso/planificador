'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getClassSessions(start: Date, end: Date) {
    try {
        const sessions = await prisma.classSession.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            }
        })
        return { success: true, data: sessions }
    } catch (error) {
        console.error("Failed to fetch sessions:", error)
        return { success: false, error: "Failed to fetch sessions" }
    }
}

export async function createClassSession(data: { title: string, date: Date, categoryId: string }) {
    try {
        const session = await prisma.classSession.create({
            data: {
                title: data.title,
                date: data.date,
                categoryId: data.categoryId
            }
        })
        revalidatePath('/fp-informatica')
        return { success: true, data: session }
    } catch (error) {
        return { success: false, error: "Failed to create session" }
    }
}

export async function updateClassSessionDate(sessionId: string, newDate: Date) {
    try {
        const session = await prisma.classSession.update({
            where: { id: sessionId },
            data: { date: newDate }
        })
        revalidatePath('/fp-informatica')
        return { success: true, data: session }
    } catch (error) {
        return { success: false, error: "Failed to update session" }
    }
}

export async function createTask(data: { title: string, categoryId: string, categorySlug?: string }) {
    try {
        const task = await prisma.actionItem.create({
            data: {
                title: data.title,
                categoryId: data.categoryId,
                status: "TODO"
            }
        })
        // Revalidate the specific category page if slug is provided, otherwise default to fp-informatica
        const path = data.categorySlug ? `/${data.categorySlug}` : '/fp-informatica'
        revalidatePath(path)
        revalidatePath('/') // Also revalidate home page
        return { success: true, data: task }
    } catch (error) {
        return { success: false, error: "Failed to create task" }
    }
}

export async function toggleTaskStatus(taskId: string, currentStatus: string, categorySlug?: string) {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE'
    try {
        await prisma.actionItem.update({
            where: { id: taskId },
            data: { status: newStatus }
        })
        // Revalidate the specific category page if slug is provided, otherwise default to fp-informatica
        const path = categorySlug ? `/${categorySlug}` : '/fp-informatica'
        revalidatePath(path)
        revalidatePath('/') // Also revalidate home page
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update task" }
    }
}

// Task Section Management
export async function createSection(data: { name: string, categoryId: string, categorySlug?: string }) {
    try {
        // Get the max order value for this category
        const maxOrder = await prisma.taskSection.findFirst({
            where: { categoryId: data.categoryId },
            orderBy: { order: 'desc' }
        })
        const newOrder = maxOrder ? maxOrder.order + 1 : 0

        const section = await prisma.taskSection.create({
            data: {
                name: data.name,
                categoryId: data.categoryId,
                order: newOrder
            }
        })
        const path = data.categorySlug ? `/${data.categorySlug}` : '/fp-informatica'
        revalidatePath(path)
        return { success: true, data: section }
    } catch (error) {
        return { success: false, error: "Failed to create section" }
    }
}

export async function updateSection(data: { sectionId: string, name: string, categorySlug?: string }) {
    try {
        const section = await prisma.taskSection.update({
            where: { id: data.sectionId },
            data: { name: data.name }
        })
        const path = data.categorySlug ? `/${data.categorySlug}` : '/fp-informatica'
        revalidatePath(path)
        return { success: true, data: section }
    } catch (error) {
        return { success: false, error: "Failed to update section" }
    }
}

export async function deleteSection(data: { sectionId: string, categorySlug?: string }) {
    try {
        // Tasks will be moved to null section (no section) due to onDelete: SetNull
        await prisma.taskSection.delete({
            where: { id: data.sectionId }
        })
        const path = data.categorySlug ? `/${data.categorySlug}` : '/fp-informatica'
        revalidatePath(path)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete section" }
    }
}

// Task Management
export async function updateTask(data: { taskId: string, title: string, categorySlug?: string }) {
    try {
        const task = await prisma.actionItem.update({
            where: { id: data.taskId },
            data: { title: data.title }
        })
        const path = data.categorySlug ? `/${data.categorySlug}` : '/fp-informatica'
        revalidatePath(path)
        revalidatePath('/')
        return { success: true, data: task }
    } catch (error) {
        return { success: false, error: "Failed to update task" }
    }
}

export async function moveTaskToSection(data: { taskId: string, sectionId: string | null, categorySlug?: string }) {
    try {
        const task = await prisma.actionItem.update({
            where: { id: data.taskId },
            data: { sectionId: data.sectionId }
        })
        const path = data.categorySlug ? `/${data.categorySlug}` : '/fp-informatica'
        revalidatePath(path)
        revalidatePath('/')
        return { success: true, data: task }
    } catch (error) {
        return { success: false, error: "Failed to move task" }
    }
}
