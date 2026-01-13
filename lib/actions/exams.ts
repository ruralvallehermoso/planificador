"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ExamHeaderData = {
    logoUrl?: string
    cycle: string
    course: string
    evaluation: string
    duration: string
    date: string
    subject: string
    raEvaluated: string[]
    description: string
}

export type ExamSection = {
    id: string
    type: 'TEST' | 'DEVELOP' | 'STANDARD'
    title: string
    content?: string // For standard sections or description
    questions?: string // For test/develop questions
    ra?: string[]
}

export type ExamFormatting = {
    font: string
    fontSize: string
    isBoldTitle: boolean
    lineHeight: string
    paragraphSpacing: string
    questionsBold?: boolean
}

export type ExamTemplateData = {
    name: string
    header: ExamHeaderData
    sections: ExamSection[]
    formatting: ExamFormatting
}

export async function saveExamTemplate(data: ExamTemplateData) {
    try {
        const { name, header, sections, formatting } = data

        const template = await prisma.examTemplate.create({
            data: {
                name,
                logoUrl: header.logoUrl,
                cycle: header.cycle,
                course: header.course,
                evaluation: header.evaluation,
                duration: header.duration,
                date: header.date,
                subject: header.subject,
                raEvaluated: JSON.stringify(header.raEvaluated),
                description: header.description,
                sections: JSON.stringify(sections),
                formatting: JSON.stringify(formatting)
            }
        })

        revalidatePath("/fp-informatica/exams/create")
        return { success: true, id: template.id }
    } catch (error) {
        console.error("Failed to save template:", error)
        return { success: false, error: "Failed to save template" }
    }
}

export async function getExamTemplates() {
    try {
        const templates = await prisma.examTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return templates
    } catch (error) {
        console.error("Failed to fetch templates:", error)
        return []
    }
}

export async function deleteTemplate(id: string) {
    try {
        await prisma.examTemplate.delete({ where: { id } })
        revalidatePath("/fp-informatica/exams/create")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete template" }
    }
}
