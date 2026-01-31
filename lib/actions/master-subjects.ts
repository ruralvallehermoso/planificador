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
            where: { categoryId },
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

export async function createSubject(data: any, categoryId: string) {
    try {
        const validated = subjectSchema.parse(data)

        await prisma.subject.create({
            data: {
                ...validated,
                categoryId
            }
        })

        revalidatePath('/master-unie/asignaturas')
        revalidatePath('/master-unie')
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

export async function updateSubject(id: string, data: any) {
    try {
        const validated = subjectSchema.parse(data)

        await prisma.subject.update({
            where: { id },
            data: validated
        })

        revalidatePath('/master-unie/asignaturas')
        revalidatePath('/master-unie')
        revalidatePath(`/master-unie/asignaturas/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating subject:", error)
        return { success: false, error: "Error al actualizar la asignatura" }
    }
}

export async function updateSubjectNotes(id: string, notes: string) {
    try {
        await prisma.subject.update({
            where: { id },
            data: { notes }
        })

        revalidatePath(`/master-unie/asignaturas/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating subject notes:", error)
        return { success: false, error: "Error al guardar las notas" }
    }
}

export async function getSubject(id: string) {
    try {
        const subject = await prisma.subject.findUnique({
            where: { id },
            include: {
                tasks: {
                    orderBy: { dueDate: 'asc' } // O la ordenación que prefieras
                },
                assessments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!subject) return { success: false, error: "Asignatura no encontrada" }

        return { success: true, subject }
    } catch (error) {
        console.error("Error fetching subject:", error)
        return { success: false, error: "Error al cargar la asignatura" }
    }
}

export async function createSubjectTask(subjectId: string, title: string, categoryId: string) {
    try {
        if (!title.trim()) return { success: false, error: "El título es obligatorio" }

        await prisma.actionItem.create({
            data: {
                title,
                subjectId,
                categoryId,
                status: 'TODO',
                priority: 'MEDIUM'
            }
        })

        revalidatePath(`/master-unie/asignaturas/${subjectId}`)
        return { success: true }
    } catch (error) {
        console.error("Error creating task:", error)
        revalidatePath(`/master-unie/asignaturas/${subjectId}`)
        return { success: false, error: "Error al crear la tarea" }
    }
}

export async function toggleSubjectTask(taskId: string, isCompleted: boolean) {
    try {
        await prisma.actionItem.update({
            where: { id: taskId },
            data: {
                isCompleted,
                status: isCompleted ? 'DONE' : 'TODO'
            }
        })

        revalidatePath('/master-unie')
        revalidatePath('/master-unie/asignaturas')
        return { success: true }
    } catch (error) {
        console.error("Error toggling task:", error)
        return { success: false, error: "Error al actualizar la tarea" }
    }
}

export async function deleteSubjectTask(taskId: string) {
    try {
        await prisma.actionItem.delete({
            where: { id: taskId }
        })

        revalidatePath('/master-unie')
        revalidatePath('/master-unie/asignaturas')
        return { success: true }
    } catch (error) {
        console.error("Error deleting task:", error)
        return { success: false, error: "Error al eliminar la tarea" }
    }
}
