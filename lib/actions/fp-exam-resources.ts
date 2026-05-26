"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { del } from "@vercel/blob"

export async function getFpExamResources() {
    try {
        const resources = await prisma.fpExamResource.findMany({
            orderBy: { createdAt: "desc" },
        })
        return { success: true, data: resources }
    } catch (error) {
        console.error("Error fetching FP Exam Resources:", error)
        return { success: false, error: "Error al cargar los recursos." }
    }
}

export async function deleteFpExamResource(id: string) {
    try {
        const resource = await prisma.fpExamResource.findUnique({
            where: { id },
        })

        if (!resource) {
            return { success: false, error: "Recurso no encontrado." }
        }

        // Eliminar de Vercel Blob
        if (resource.url) {
            try {
                await del(resource.url)
            } catch (blobError) {
                console.error("Error deleting from Blob storage:", blobError)
                // Continuamos aunque falle el borrado en blob (podría no existir ya)
            }
        }

        // Eliminar de la base de datos
        await prisma.fpExamResource.delete({
            where: { id },
        })

        revalidatePath("/fp-informatica/recursos")
        revalidatePath("/fp-informatica/exams")
        return { success: true }
    } catch (error) {
        console.error("Error deleting FP Exam Resource:", error)
        return { success: false, error: "Error al eliminar el recurso." }
    }
}
