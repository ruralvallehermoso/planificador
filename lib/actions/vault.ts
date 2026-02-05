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

export async function updateVaultItem(id: string, userId: string, data: {
    title: string
    category: string
    encryptedData: string
}) {
    try {
        // Verify ownership
        const existing = await prisma.vaultItem.findUnique({
            where: { id },
            select: { userId: true }
        })

        if (!existing || existing.userId !== userId) {
            return { success: false, error: 'Unauthorized or not found' }
        }

        const item = await prisma.vaultItem.update({
            where: { id },
            data: {
                title: data.title,
                category: data.category,
                encryptedData: data.encryptedData,
            }
        })
        revalidatePath('/finanzas/vault')
        return { success: true, data: item }
    } catch (error) {
        console.error('Failed to update vault item:', error)
        return { success: false, error: 'Failed to update item' }
    }
}

export async function deleteVaultItem(id: string, userId: string) {
    try {
        // Verify ownership implicit by deleteMany with userId or findFirst
        const count = await prisma.vaultItem.deleteMany({
            where: {
                id,
                userId
            }
        })

        if (count.count === 0) {
            return { success: false, error: 'Item not found or unauthorized' }
        }

        revalidatePath('/finanzas/vault')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete vault item:', error)
        return { success: false, error: 'Failed to delete item' }
    }
}

// --- Validator / Setup Utils ---

export async function checkVaultSetup(userId: string) {
    try {
        const config = await prisma.vaultConfig.findUnique({
            where: { userId }
        })
        return { success: true, isSetup: !!config }
    } catch (error) {
        return { success: false, error: 'Failed to check setup' }
    }
}

export async function setupVault(userId: string, validatorHash: string) {
    try {
        // Create config
        await prisma.vaultConfig.create({
            data: {
                userId,
                validator: validatorHash
            }
        })
        return { success: true }
    } catch (error) {
        console.error("Setup failed", error)
        return { success: false, error: 'Failed to setup vault' }
    }
}

export async function verifyVaultKey(userId: string, validatorHash: string) {
    try {
        const config = await prisma.vaultConfig.findUnique({
            where: { userId }
        })

        if (!config) return { success: false, error: 'Not setup' }

        const isValid = config.validator === validatorHash
        return { success: true, isValid }
    } catch (error) {
        return { success: false, error: 'Verification failed' }
    }
}
