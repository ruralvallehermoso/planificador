import { z } from 'zod';

export const createVaultItemSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    category: z.enum(["LOGIN", "CARD", "NOTE", "FINANCIAL", "OTHER"]),
    encryptedDek: z.string().min(1),
    encryptedData: z.string().min(1),
    sectionId: z.string().optional().nullable()
});

export const updateVaultItemSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    category: z.enum(["LOGIN", "CARD", "NOTE", "FINANCIAL", "OTHER"]),
    encryptedData: z.string().min(1),
    sectionId: z.string().optional().nullable()
});

export const setupVaultSchema = z.object({
    validatorHash: z.string().min(10)
});
