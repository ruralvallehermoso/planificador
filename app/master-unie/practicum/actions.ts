'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Assuming auth helper exists
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- TASKS ACTIONS ---



// --- INTERNSHIP ACTIONS ---

// --- Fetching ---

export async function getInternship() {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Assuming one internship per user for now, or we could look up by category/subject if needed.
    // Given the previous schema, we linked Internship to User uniquely.
    const internship = await prisma.internship.findUnique({
        where: { userId: session.user.id },
        include: {
            center: true,
            logs: {
                orderBy: { date: 'desc' }
            }
        }
    });

    return internship;
}

// --- Mutations ---

export async function updateInternshipDetails(data: {
    centerName: string;
    address?: string;
    province?: string;
    city?: string;
    tutorName?: string;
    tutorEmail?: string;
    tutorPhone?: string;
    universityTutor?: string;
    startDate?: Date;
    endDate?: Date;
    realStartDate?: Date;
    realEndDate?: Date;
    totalHours?: number;
    schedule?: string;
    workingDays?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Upsert Internship
    const internship = await prisma.internship.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            status: 'IN_PROGRESS',
            startDate: data.startDate,
            endDate: data.endDate,
            realStartDate: data.realStartDate,
            realEndDate: data.realEndDate,
            totalHours: data.totalHours || 120,
            schedule: data.schedule,
            workingDays: data.workingDays || "1,2,3,4,5",
            center: {
                create: {
                    name: data.centerName,
                    address: data.address,
                    province: data.province,
                    city: data.city,
                    tutorName: data.tutorName,
                    tutorEmail: data.tutorEmail,
                    tutorPhone: data.tutorPhone,
                    universityTutor: data.universityTutor,
                }
            }
        },
        update: {
            startDate: data.startDate,
            endDate: data.endDate,
            realStartDate: data.realStartDate,
            realEndDate: data.realEndDate,
            totalHours: data.totalHours,
            schedule: data.schedule,
            workingDays: data.workingDays,
            center: {
                upsert: {
                    create: {
                        name: data.centerName,
                        address: data.address,
                        province: data.province,
                        city: data.city,
                        tutorName: data.tutorName,
                        tutorEmail: data.tutorEmail,
                        tutorPhone: data.tutorPhone,
                        universityTutor: data.universityTutor,
                    },
                    update: {
                        name: data.centerName,
                        address: data.address,
                        province: data.province,
                        city: data.city,
                        tutorName: data.tutorName,
                        tutorEmail: data.tutorEmail,
                        tutorPhone: data.tutorPhone,
                        universityTutor: data.universityTutor,
                    }
                }
            }
        }
    });

    revalidatePath('/master-unie/practicum');
    return { success: true, internship };
}

export async function addLogEntry(data: {
    date: Date;
    hours: number;
    activity: string;
    observations?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const internship = await prisma.internship.findUnique({
        where: { userId: session.user.id }
    });

    if (!internship) throw new Error("Internship not found");

    await prisma.internshipLog.create({
        data: {
            internshipId: internship.id,
            date: data.date,
            hours: data.hours,
            activity: data.activity,
            observations: data.observations
        }
    });

    revalidatePath('/master-unie/practicum');
    return { success: true };
}

export async function updateLogEntry(logId: string, data: {
    date: Date;
    hours: number;
    activity: string;
    observations?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const log = await prisma.internshipLog.findUnique({
        where: { id: logId },
        include: { internship: true }
    });

    if (!log || log.internship.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await prisma.internshipLog.update({
        where: { id: logId },
        data: {
            date: data.date,
            hours: data.hours,
            activity: data.activity,
            observations: data.observations
        }
    });

    revalidatePath('/master-unie/practicum');
    return { success: true };
}

export async function deleteLogEntry(logId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const log = await prisma.internshipLog.findUnique({
        where: { id: logId },
        include: { internship: true }
    });

    if (!log || log.internship.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await prisma.internshipLog.delete({
        where: { id: logId }
    });

    revalidatePath('/master-unie/practicum');
    return { success: true };
}

export async function duplicateLogEntry(logId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership & get data
    const existingLog = await prisma.internshipLog.findUnique({
        where: { id: logId },
        include: { internship: true }
    });

    if (!existingLog || existingLog.internship.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    // Create copy (using same date or today? Let's use the same date as the original for now, user can edit. 
    // Or better, maybe today's date if it's a "repeat this today" action. 
    // Typically "Duplicate" implies exact copy. "Copy to Today" implies date change.
    // I'll make an exact copy and append "(Copia)" to observation to be safe/clear.

    await prisma.internshipLog.create({
        data: {
            internshipId: existingLog.internshipId,
            date: existingLog.date,
            hours: existingLog.hours,
            activity: existingLog.activity,
            observations: existingLog.observations ? `${existingLog.observations} (Copia)` : '(Copia)'
        }
    });

    revalidatePath('/master-unie/practicum');
    return { success: true };
}
