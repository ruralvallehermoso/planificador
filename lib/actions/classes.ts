'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const classSchema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().optional(),
    date: z.string().transform((str) => new Date(str)),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    content: z.string().optional(),
    driveLink: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),
    categoryId: z.string(),
})

export async function createClass(formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        content: formData.get('content'),
        driveLink: formData.get('driveLink'),
        categoryId: formData.get('categoryId'),
    }

    try {
        const data = classSchema.parse(rawData)

        // Remove empty strings for optional fields
        if (data.driveLink === '') data.driveLink = undefined

        await prisma.classSession.create({
            data: {
                ...data,
            }
        })

        revalidatePath('/fp-informatica/classes')
        return { success: true }
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { error: e.issues[0].message }
        }
        return { error: 'Error al crear la clase' }
    }
}

export async function updateClass(id: string, formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        content: formData.get('content'),
        driveLink: formData.get('driveLink'),
        categoryId: formData.get('categoryId'),
    }

    try {
        const data = classSchema.parse(rawData)

        // Remove empty strings for optional fields
        if (data.driveLink === '') data.driveLink = undefined

        await prisma.classSession.update({
            where: { id },
            data: { ...data }
        })

        revalidatePath('/fp-informatica/classes')
        return { success: true }
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { error: e.issues[0].message }
        }
        return { error: 'Error al actualizar la clase' }
    }
}


export async function deleteClass(id: string) {
    try {
        await prisma.classSession.delete({
            where: { id }
        })
        revalidatePath('/fp-informatica/classes')
        return { success: true }
    } catch (e) {
        return { error: 'Error al eliminar la clase' }
    }
}
