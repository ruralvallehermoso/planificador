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

export async function getSubjectNotes(subjectId: string) {
    try {
        const notes = await prisma.subjectNote.findMany({
            where: { subjectId },
            orderBy: { date: 'desc' },
            include: { images: true }
        })
        return { success: true, notes }
    } catch (error) {
        console.error("Error fetching notes:", error)
        return { success: false, error: "Error al cargar notas" }
    }
}

export async function createSubjectNote(subjectId: string, content: string, date: Date, imageUrls: string[] = []) {
    try {
        const note = await prisma.subjectNote.create({
            data: {
                subjectId,
                content,
                date,
                images: {
                    create: imageUrls.map(url => ({ url }))
                }
            },
            include: { images: true }
        })
        revalidatePath(`/master-unie/asignaturas/${subjectId}`)
        return { success: true, note }
    } catch (error) {
        console.error("Error creating note:", error)
        return { success: false, error: "Error al crear nota" }
    }
}

export async function updateSubjectNote(noteId: string, content: string, date: Date, imageUrls: string[]) {
    try {
        // Update content and date
        const note = await prisma.subjectNote.update({
            where: { id: noteId },
            data: { content, date }
        })

        // Handle images: delete specific ones if needed? 
        // For simplicity: We will keep adding new ones or just assume 'imageUrls' is the new state?
        // Implementing full sync logic is complex. 
        // Let's assume we just ADD for now, or replace all if we want full sync.
        // Full sync approach:
        await prisma.noteImage.deleteMany({ where: { noteId } })
        if (imageUrls.length > 0) {
            await prisma.noteImage.createMany({
                data: imageUrls.map(url => ({ noteId, url }))
            })
        }

        revalidatePath(`/master-unie/asignaturas/${note.subjectId}`) // We need subjectId but note return has it? Yes.
        // Actually revalidatePath might not work perfectly without exact path, but we usually know it.
        // Let's fetch subjectId if we lose it or just rely on note.subjectId if update returns it.

        return { success: true }
    } catch (error) {
        console.error("Error updating note:", error)
        return { success: false, error: "Error al actualizar nota" }
    }
}

export async function deleteSubjectNote(noteId: string, subjectId: string) {
    try {
        await prisma.subjectNote.delete({ where: { id: noteId } })
        revalidatePath(`/master-unie/asignaturas/${subjectId}`)
        return { success: true }
    } catch (error) {
        console.error("Error deleting note:", error)
        return { success: false, error: "Error al borrar nota" }
    }
}

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
                    orderBy: { dueDate: 'asc' }
                },
                assessments: {
                    orderBy: { createdAt: 'desc' }
                },
                notesList: {
                    include: { images: true },
                    orderBy: { date: 'desc' }
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
