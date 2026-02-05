'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createVaultItem(data: {
    userId: string
    title: string
    category: string
    encryptedDek: string
    encryptedData: string
}) {
    try {
        const item = await prisma.vaultItem.create({
            data: {
                userId: data.userId,
                title: data.title,
                category: data.category,
                encryptedDek: data.encryptedDek,
                encryptedData: data.encryptedData,
            }
        })
        revalidatePath('/finanzas/vault')
        return { success: true, data: item }
    } catch (error) {
        console.error('Failed to create vault item:', error)
        return { success: false, error: 'Failed to create item' }
    }
}

export async function getVaultItems(userId: string) {
    try {
        const items = await prisma.vaultItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                category: true,
                encryptedDek: true,
                encryptedData: true,
                createdAt: true
            }
        })
        return { success: true, data: items }
    } catch (error) {
        console.error('Failed to fetch vault items:', error)
        return { success: false, error: 'Failed to fetch items' }
    }
}
