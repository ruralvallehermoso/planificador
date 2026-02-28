'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getHomeSuministros() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autorizado');

    return await prisma.homeSuministro.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createHomeSuministro(data: {
    name: string;
    provider?: string;
    contractRef?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
    url?: string;
    cost?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autorizado');

    const created = await prisma.homeSuministro.create({
        data: {
            ...data,
            userId: session.user.id
        }
    });
    revalidatePath('/hogar/suministros');
    return created;
}

export async function updateHomeSuministro(id: string, data: {
    name?: string;
    provider?: string;
    contractRef?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
    url?: string;
    cost?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autorizado');

    const suministro = await prisma.homeSuministro.findUnique({ where: { id } });
    if (!suministro || suministro.userId !== session.user.id) {
        throw new Error('Suministro no encontrado o no autorizado');
    }

    const updated = await prisma.homeSuministro.update({
        where: { id },
        data
    });
    revalidatePath('/hogar/suministros');
    return updated;
}

export async function deleteHomeSuministro(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autorizado');

    const suministro = await prisma.homeSuministro.findUnique({ where: { id } });
    if (!suministro || suministro.userId !== session.user.id) {
        throw new Error('Suministro no encontrado o no autorizado');
    }

    await prisma.homeSuministro.delete({ where: { id } });
    revalidatePath('/hogar/suministros');
    return { success: true };
}
