'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const topicSchema = z.object({
    title: z.string().min(1, "El título del tema es obligatorio"),
    materialLink: z.string().optional().or(z.literal('')),
})

const practiceSchema = z.object({
    title: z.string().min(1, "El título de la práctica es obligatorio"),
    deliveryDate: z.string().optional().or(z.literal('')),
    statementLink: z.string().optional().or(z.literal('')),
    deliveryFolderLink: z.string().optional().or(z.literal('')),
})

const subjectSchema = z.object({
    name: z.string().min(1, "El nombre de la asignatura es obligatorio"),
    code: z.string().optional(),
    semester: z.string().transform(val => parseInt(val)).or(z.number()),
    description: z.string().optional(),
    content: z.string().optional(),
    topics: z.array(topicSchema).optional(),
    practices: z.array(practiceSchema).optional(),
})

export async function createSubject(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        code: formData.get('code'),
        semester: formData.get('semester'),
        description: formData.get('description'),
        content: formData.get('content'),
        topics: JSON.parse(formData.get('topics') as string || '[]'),
        practices: JSON.parse(formData.get('practices') as string || '[]'),
    }

    try {
        const data = subjectSchema.parse(rawData)

        const category = await prisma.category.findUnique({
            where: { slug: 'fp-informatica' }
        })

        if (!category) throw new Error("Categoría FP no encontrada")

        await prisma.subject.create({
            data: {
                name: data.name,
                code: data.code,
                semester: data.semester,
                description: data.description,
                notes: data.content,
                categoryId: category.id,
                topics: {
                    create: data.topics?.map((t, idx) => ({
                        title: t.title,
                        materialLink: t.materialLink || undefined,
                        order: idx
                    }))
                },
                practices: {
                    create: data.practices?.map((p, idx) => ({
                        title: p.title,
                        deliveryDate: p.deliveryDate ? new Date(p.deliveryDate) : undefined,
                        statementLink: p.statementLink || undefined,
                        deliveryFolderLink: p.deliveryFolderLink || undefined,
                        order: idx
                    }))
                }
            }
        })

        revalidatePath('/fp-informatica')
        revalidatePath('/fp-informatica/subjects')
        return { success: true }
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { error: e.issues[0].message }
        }
        console.error(e)
        return { error: 'Error al crear la asignatura' }
    }
}

export async function updateSubject(id: string, formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        code: formData.get('code'),
        semester: formData.get('semester'),
        description: formData.get('description'),
        content: formData.get('content'),
        topics: JSON.parse(formData.get('topics') as string || '[]'),
        practices: JSON.parse(formData.get('practices') as string || '[]'),
    }

    try {
        const data = subjectSchema.parse(rawData)

        // Transactional update: update main fields, replace sub-items
        await prisma.$transaction(async (tx) => {
            await tx.subject.update({
                where: { id },
                data: {
                    name: data.name,
                    code: data.code,
                    semester: data.semester,
                    description: data.description,
                    notes: data.content,
                }
            })

            // Replace topics
            await tx.subjectTopic.deleteMany({ where: { subjectId: id } })
            if (data.topics && data.topics.length > 0) {
                await tx.subjectTopic.createMany({
                    data: data.topics.map((t, idx) => ({
                        subjectId: id,
                        title: t.title,
                        materialLink: t.materialLink || undefined,
                        order: idx
                    }))
                })
            }

            // Replace practices
            await tx.subjectPractice.deleteMany({ where: { subjectId: id } })
            if (data.practices && data.practices.length > 0) {
                await tx.subjectPractice.createMany({
                    data: data.practices.map((p, idx) => ({
                        subjectId: id,
                        title: p.title,
                        deliveryDate: p.deliveryDate ? new Date(p.deliveryDate) : undefined,
                        statementLink: p.statementLink || undefined,
                        deliveryFolderLink: p.deliveryFolderLink || undefined,
                        order: idx
                    }))
                })
            }
        })

        revalidatePath('/fp-informatica')
        revalidatePath('/fp-informatica/subjects')
        revalidatePath(`/fp-informatica/subjects/${id}/edit`)
        return { success: true }
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { error: e.issues[0].message }
        }
        console.error(e)
        return { error: 'Error al actualizar la asignatura' }
    }
}

export async function deleteSubject(id: string) {
    try {
        await prisma.subject.delete({ where: { id } })
        revalidatePath('/fp-informatica')
        revalidatePath('/fp-informatica/subjects')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Error al eliminar la asignatura' }
    }
}
