'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getExamGradeReport(examId: string) {
    try {
        const report = await prisma.examGradeReport.findUnique({
            where: { examId }
        })
        return { success: true, report }
    } catch (error) {
        console.error('Error fetching grade report:', error)
        return { success: false, error: 'Failed to fetch report' }
    }
}

export async function saveExamGradeReport(
    examId: string,
    data: {
        notes?: string
        rawData?: any
        config?: any
    }
) {
    try {
        const report = await prisma.examGradeReport.upsert({
            where: { examId },
            update: {
                notes: data.notes,
                rawData: data.rawData,
                config: data.config,
                updatedAt: new Date()
            },
            create: {
                examId,
                notes: data.notes,
                rawData: data.rawData,
                config: data.config
            }
        })

        revalidatePath(`/fp-informatica/exams/${examId}`)
        return { success: true, report }
    } catch (error) {
        console.error('Error saving grade report:', error)
        return { success: false, error: 'Failed to save report' }
    }
}
