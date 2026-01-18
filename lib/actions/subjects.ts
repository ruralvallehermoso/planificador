'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const subjectSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    code: z.string().optional(),
    professor: z.string().optional(),
    credits: z.number().min(0).default(6),
    semester: z.number().min(1).default(1),
})

export async function getSubjects(categoryId: string) {
    try {
        const subjects = await prisma.subject.findMany({
            where: { categoryId }, // Filter by category
            orderBy: { semester: 'asc' },
            include: {
                _count: {
                    select: { tasks: true, assessments: true }
                }
            }
        })
        return { success: true, subjects }
    } catch (error) {
        console.error("Error fetching subjects:", error)
        return { success: false, error: "Error al cargar las asignaturas" }
    }
}

export async function createSubject(data: z.infer<typeof subjectSchema>, categoryId: string) {
    try {
        const validated = subjectSchema.parse(data)

        await prisma.subject.create({
            data: {
                ...validated,
                categoryId
            }
        })

        revalidatePath('/master-unie/asignaturas')
        revalidatePath('/master-unie') // Dashboard
        return { success: true }
    } catch (error) {
        console.error("Error creating subject:", error)
        return { success: false, error: "Error al crear la asignatura" }
    }
}

export async function deleteSubject(id: string) {
    try {
        await prisma.subject.delete({
            where: { id }
        })

        revalidatePath('/master-unie/asignaturas')
        revalidatePath('/master-unie')
        return { success: true }
    } catch (error) {
        console.error("Error deleting subject:", error)
        return { success: false, error: "Error al eliminar la asignatura" }
    }
}
