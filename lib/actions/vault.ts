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
