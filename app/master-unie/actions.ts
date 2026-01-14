'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addMasterTask(title: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    if (!title.trim()) return;

    await prisma.masterTask.create({
        data: {
            title,
            userId: session.user.id,
        }
    });

    revalidatePath("/master-unie");
}

export async function toggleMasterTask(taskId: string, completed: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.masterTask.update({
        where: { id: taskId },
        data: { completed }
    });

    revalidatePath("/master-unie");
}

export async function deleteMasterTask(taskId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.masterTask.delete({
        where: { id: taskId }
    });

    revalidatePath("/master-unie");
}

export async function getMasterTasks() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.masterTask.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateMasterTask(taskId: string, title: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    if (!title.trim()) return;

    await prisma.masterTask.update({
        where: { id: taskId },
        data: { title }
    });

    revalidatePath("/master-unie");
}
