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
    part1Percentage?: string
    part2Percentage?: string
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
    grading: {
        testPointsPerQuestion: number
        testPenaltyPerError: number
        testMaxScore: number
    }
}

export async function saveExamTemplate(data: ExamTemplateData, id?: string) {
    try {
        const { name, header, sections, formatting } = data

        const payload = {
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
            part1Percentage: header.part1Percentage,
            part2Percentage: header.part2Percentage,
            sections: JSON.stringify(sections),
            formatting: JSON.stringify(formatting),
            testPointsPerQuestion: data.grading.testPointsPerQuestion,
            testPenaltyPerError: data.grading.testPenaltyPerError,
            testMaxScore: data.grading.testMaxScore,
        }

        let template;
        if (id) {
            template = await prisma.examTemplate.update({
                where: { id },
                data: payload
            })
        } else {
            template = await prisma.examTemplate.create({
                data: payload
            })
        }

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

export async function generateExamSolution(data: ExamTemplateData) {
    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
            return { success: false, error: "API Key not configured" };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
        Actúa como un profesor experto de Formación Profesional en Informática.
        Genera un SOLUCIONARIO detallado y didáctico para el siguiente examen.
        
        DATOS DEL EXAMEN:
        Módulo: ${data.header.subject}
        Ciclo: ${data.header.cycle}
        Curso: ${data.header.course}
        Evaluación: ${data.header.evaluation}
        
        CONTENIDO DEL EXAMEN:
        ${data.sections.map((s, i) => `
        SECCIÓN ${i + 1}: ${s.title} (${s.type})
        ${s.questions || s.content || ''}
        `).join('\n')}
        
        INSTRUCCIONES DE FORMATO:
        Genera la respuesta en formato HTML limpio y estructurado (sin tags <html> ni <body>, solo el contenido).
        Usa estilos en línea (inline css) muy básicos si es necesario para resaltar títulos.
        Para las preguntas tipo TEST: Indica claramente la opción correcta y una breve justificación.
        Para las preguntas de DESARROLLO/ESTÁNDAR: Proporciona una respuesta modelo completa y los puntos clave que debe contener.
        
        Estructura el solucionario por secciones igual que el examen.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return { success: true, solution: text };
    } catch (error) {
        console.error("Failed to generate solution:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Error: ${errorMessage}` };
    }
}
