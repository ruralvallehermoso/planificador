"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as cheerio from "cheerio"

/**
 * Importa un archivo HTML de Bookmarks de Chrome
 * Solo procesaremos las carpetas y enlaces (de primer o segundo nivel)
 */
export async function importChromeBookmarks(htmlContent: string) {
    try {
        const $ = cheerio.load(htmlContent)

        // Limpia los marcadores y carpetas anteriores (Opcional, pero recomendable si queremos reemplazar)
        // Para este requerimiento, si importamos, en vez de borrar todo podemos solo añadir
        // pero vamos a purgar la tabla de FpBookmarks para evitar duplicados infinitos por ahora
        await prisma.fpBookmark.deleteMany({})
        await prisma.fpBookmarkFolder.deleteMany({})

        const foldersToCreate: any[] = []

        // Los marcadores de Chrome se estructuran en <DT><H3> Nombre Carpeta </H3>
        // Seguido inmediatamente por un <DL><p> que contiene los <DT><A> Enlaces </A>
        $("dt > h3").each((i, folderEl) => {
            const folderName = $(folderEl).text().trim()

            // Ignorar carpetas ocultas o por defecto si se requiere, de momento importamos todas
            // El contenedor de enlaces es el siguiente hermano <dl>
            const linksContainer = $(folderEl).parent().children("dl").first()

            const links: { title: string, url: string, iconUrl?: string }[] = []

            linksContainer.find("dt > a").each((j, linkEl) => {
                const title = $(linkEl).text().trim() || "Sin título"
                const url = $(linkEl).attr("href")
                const iconUrl = $(linkEl).attr("icon")

                if (url) {
                    links.push({ title, url, iconUrl })
                }
            })

            if (links.length > 0) {
                foldersToCreate.push({
                    name: folderName,
                    order: i,
                    links
                })
            }
        })

        // Insertar en la base de datos de manera transaccional
        await prisma.$transaction(async (tx) => {
            for (const folderData of foldersToCreate) {
                const createdFolder = await tx.fpBookmarkFolder.create({
                    data: {
                        name: folderData.name,
                        order: folderData.order
                    }
                })

                if (folderData.links.length > 0) {
                    await tx.fpBookmark.createMany({
                        data: folderData.links.map((link: any) => ({
                            title: link.title,
                            url: link.url,
                            iconUrl: link.iconUrl,
                            folderId: createdFolder.id
                        }))
                    })
                }
            }
        })

        revalidatePath("/fp-informatica/bookmarks")
        revalidatePath("/fp-informatica")

        return { success: true, message: "Marcadores importados correctamente" }
    } catch (error) {
        console.error("Error importing bookmarks:", error)
        return { success: false, message: "Error al importar los marcadores" }
    }
}

export async function getBookmarks() {
    try {
        const folders = await prisma.fpBookmarkFolder.findMany({
            include: {
                bookmarks: true
            },
            orderBy: {
                order: 'asc'
            }
        })
        return { success: true, data: folders }
    } catch (error) {
        console.error("Error fetching bookmarks:", error)
        return { success: false, message: "Error al obtener marcadores" }
    }
}

/**
 * Eliminar todo
 */
export async function clearBookmarks() {
    try {
        await prisma.fpBookmark.deleteMany({})
        await prisma.fpBookmarkFolder.deleteMany({})

        revalidatePath("/fp-informatica/bookmarks")
        return { success: true, message: "Marcadores eliminados" }
    } catch (error) {
        console.error("Error deleting bookmarks:", error)
        return { success: false, message: "Error al limpiar marcadores" }
    }
}
