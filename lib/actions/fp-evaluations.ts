"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export type FpEvaluationData = {
    name?: string
    cycle: string
    subject: string
    course: string
    evaluation: string
    description?: string
}

export async function createFpEvaluation(data: FpEvaluationData) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return { success: false, error: "Unauthorized" }

    try {
        const evaluation = await prisma.fpEvaluation.create({
            data: {
                name: data.name,
                cycle: data.cycle,
                subject: data.subject,
                course: data.course,
                evaluation: data.evaluation,
                description: data.description,
            }
        })
        revalidatePath("/fp-informatica", "layout")
        return { success: true, id: evaluation.id }
    } catch (error) {
        console.error("Failed to create evaluation:", error)
        return { success: false, error: "Failed to create evaluation" }
    }
}

export async function updateFpEvaluation(id: string, data: FpEvaluationData) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return { success: false, error: "Unauthorized" }

    try {
        const evaluation = await prisma.fpEvaluation.update({
            where: { id },
            data: {
                name: data.name,
                cycle: data.cycle,
                subject: data.subject,
                course: data.course,
                evaluation: data.evaluation,
                description: data.description,
            }
        })
        revalidatePath("/fp-informatica", "layout")
        return { success: true, id: evaluation.id }
    } catch (error) {
        console.error("Failed to update evaluation:", error)
        return { success: false, error: "Failed to update evaluation" }
    }
}

export async function getFpEvaluations() {
    try {
        const evaluations = await prisma.fpEvaluation.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return evaluations
    } catch (error) {
        console.error("Failed to fetch evaluations:", error)
        return []
    }
}

export async function getFpEvaluationById(id: string) {
    try {
        const evaluation = await prisma.fpEvaluation.findUnique({
            where: { id }
        })
        return evaluation
    } catch (error) {
        console.error("Failed to fetch evaluation:", error)
        return null
    }
}

export async function deleteFpEvaluation(id: string) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return { success: false, error: "Unauthorized" }

    try {
        await prisma.fpEvaluation.delete({ where: { id } })
        revalidatePath("/fp-informatica", "layout")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete evaluation:", error)
        return { success: false, error: "Failed to delete evaluation" }
    }
}

// Special action to save the parsed JSON from Excel
export async function updateFpEvaluationData(id: string, studentsData: any, selectedCriteria: any = null) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return { success: false, error: "Unauthorized" }

    try {
        const updateData: any = { studentsData }
        if (selectedCriteria !== null) {
            updateData.selectedCriteria = selectedCriteria
        }

        const evaluation = await prisma.fpEvaluation.update({
            where: { id },
            data: updateData
        })
        revalidatePath("/fp-informatica/evaluations/[id]", "page")
        return { success: true, id: evaluation.id }
    } catch (error) {
        console.error("Failed to update evaluation data:", error)
        return { success: false, error: "Failed to update evaluation data" }
    }
}
