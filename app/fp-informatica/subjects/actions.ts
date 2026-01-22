'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export type PracticeInput = {
    title: string
    date?: string
    objectives?: string
    description?: string
    subjectId: string
    id?: string
    formatting?: string
}

export async function createSubjectPractice(data: PracticeInput) {
    const session = await auth()

    if (!session?.user) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const practice = await prisma.subjectPractice.create({
            data: {
                title: data.title,
                subjectId: data.subjectId,
                deliveryDate: data.date ? new Date(data.date) : null,
                objectives: data.objectives,
                description: data.description,
                formatting: data.formatting,
            }
        })

        revalidatePath(`/fp-informatica/subjects/${data.subjectId}`)
        return { success: true, id: practice.id }
    } catch (error) {
        console.error("Error creating practice:", error)
        return { success: false, error: "Failed to create practice" }
    }
}

export async function updateSubjectPractice(data: PracticeInput) {
    const session = await auth()

    if (!session?.user) {
        return { success: false, error: "Unauthorized" }
    }

    if (!data.id) {
        return { success: false, error: "Practice ID is required for update" }
    }

    try {
        const practice = await prisma.subjectPractice.update({
            where: { id: data.id },
            data: {
                title: data.title,
                deliveryDate: data.date ? new Date(data.date) : null,
                objectives: data.objectives,
                description: data.description,
                formatting: data.formatting,
            }
        })

        revalidatePath(`/fp-informatica/subjects/${data.subjectId}`)
        return { success: true, id: practice.id }
    } catch (error) {
        console.error("Error updating practice:", error)
        return { success: false, error: "Failed to update practice" }
    }
}

export async function getSubjectPractice(id: string) {
    const session = await auth()

    if (!session?.user) {
        return null
    }

    try {
        const practice = await prisma.subjectPractice.findUnique({
            where: { id }
        })
        return practice
    } catch (error) {
        console.error("Error fetching practice:", error)
        return null
    }
}

export async function deleteSubjectPractice(id: string) {
    const session = await auth()

    if (!session?.user) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const practice = await prisma.subjectPractice.delete({
            where: { id }
        })

        revalidatePath(`/fp-informatica/subjects/${practice.subjectId}`)
        return { success: true }
    } catch (error) {
        console.error("Error deleting practice:", error)
        return { success: false, error: "Failed to delete practice" }
    }
}

// TOPIC ACTIONS

export type TopicInput = {
    title: string
    materialLink?: string
    subjectId: string
    id?: string
    order?: number
}

export async function createSubjectTopic(data: TopicInput) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    try {
        const topic = await prisma.subjectTopic.create({
            data: {
                title: data.title,
                materialLink: data.materialLink,
                subjectId: data.subjectId,
                order: data.order ?? 0
            }
        })
        revalidatePath(`/fp-informatica/subjects/${data.subjectId}`)
        return { success: true, id: topic.id }
    } catch (error) {
        console.error("Error creating topic:", error)
        return { success: false, error: "Failed to create topic" }
    }
}

export async function updateSubjectTopic(data: TopicInput) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    if (!data.id) return { success: false, error: "Topic ID required" }

    try {
        const topic = await prisma.subjectTopic.update({
            where: { id: data.id },
            data: {
                title: data.title,
                materialLink: data.materialLink,
                order: data.order
            }
        })
        revalidatePath(`/fp-informatica/subjects/${data.subjectId}`)
        return { success: true, id: topic.id }
    } catch (error) {
        console.error("Error updating topic:", error)
        return { success: false, error: "Failed to update topic" }
    }
}

export async function deleteSubjectTopic(id: string) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    try {
        const topic = await prisma.subjectTopic.delete({
            where: { id }
        })
        revalidatePath(`/fp-informatica/subjects/${topic.subjectId}`)
        return { success: true }
    } catch (error) {
        console.error("Error deleting topic:", error)
        return { success: false, error: "Failed to delete topic" }
    }
}

export async function getSubjectTopic(id: string) {
    const session = await auth()
    if (!session?.user) return null

    try {
        return await prisma.subjectTopic.findUnique({ where: { id } })
    } catch (error) {
        console.error("Error fetching topic:", error)
        return null
    }
}
