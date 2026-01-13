"use client"

import { useState, useEffect } from "react"
import { ExamHeaderForm } from "./ExamHeaderForm"
import { ExamSectionsBuilder } from "./ExamSectionsBuilder"
import { ExamFormattingForm } from "./ExamFormattingForm"
import { ExamPreview } from "./ExamPreview"
import { ExamHeaderData, ExamSection, ExamFormatting, saveExamTemplate, getExamTemplates, ExamTemplateData } from "@/lib/actions/exams"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Save, Loader2, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DEFAULT_HEADER: ExamHeaderData = {
    cycle: "", course: "", evaluation: "", duration: "", date: "",
    subject: "", raEvaluated: [], description: ""
}

const DEFAULT_FORMATTING: ExamFormatting = {
    font: "font-sans", fontSize: "text-base", isBoldTitle: true,
    lineHeight: "leading-normal", paragraphSpacing: "space-y-4"
}

export function ExamFormBuilder() {
    const [header, setHeader] = useState<ExamHeaderData>(DEFAULT_HEADER)
    const [sections, setSections] = useState<ExamSection[]>([])
    const [formatting, setFormatting] = useState<ExamFormatting>(DEFAULT_FORMATTING)
    const [templates, setTemplates] = useState<any[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState("")
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)

    // Load templates on mount
    useEffect(() => {
        loadTemplates()
    }, [])

    const loadTemplates = async () => {
        const t = await getExamTemplates()
        setTemplates(t)
    }

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setHeader({
                logoUrl: template.logoUrl,
                cycle: template.cycle,
                course: template.course,
                evaluation: template.evaluation,
                duration: template.duration,
                date: template.date,
                subject: template.subject,
                raEvaluated: JSON.parse(template.raEvaluated || "[]"),
                description: template.description
            })
            setSections(JSON.parse(template.sections))
            setFormatting(JSON.parse(template.formatting))
        }
    }

    const handleSaveTemplate = async () => {
        if (!newTemplateName) return
        setIsSaving(true)
        const data: ExamTemplateData = {
            name: newTemplateName,
            header,
            sections,
            formatting
        }
        const result = await saveExamTemplate(data)
        if (result.success) {
            // Force reload or optimistically add
            await loadTemplates()
            // Optional: Select the new template
            // if (result.id) handleLoadTemplate(result.id)
        }
        setIsSaving(false)
        setSaveDialogOpen(false)
        setNewTemplateName("")
    }

    const handlePrint = () => {
        window.print()
    }

    const handleExportDoc = () => {
        const fontMap: Record<string, string> = {
            'font-sans': 'Arial, sans-serif',
            'font-serif': '"Times New Roman", serif',
            'font-mono': '"Courier New", monospace',
            "font-[Arial]": 'Arial, sans-serif',
            "font-[Verdana]": 'Verdana, sans-serif',
            "font-[Helvetica]": 'Helvetica, sans-serif',
            "font-['Times_New_Roman']": '"Times New Roman", serif',
            "font-[Georgia]": 'Georgia, serif',
            "font-['Courier_New']": '"Courier New", monospace',
            "font-['Trebuchet_MS']": '"Trebuchet MS", sans-serif',
            "font-[Impact]": 'Impact, sans-serif',
        }
        const fontFamily = fontMap[formatting.font] || 'Arial, sans-serif'

        // Helper to formatting questions for export
        const formatQuestionsExport = (text: string, isTest: boolean) => {
            if (!text) return ''

            if (isTest) {
                return text.split('\n').map(line => {
                    const isQuestion = /^\d+[\.\)]/.test(line.trim())
                    const style = isQuestion && (formatting.questionsBold ?? true) ? 'font-weight: bold; margin-top: 10px;' : 'margin-left: 20px;'
                    return `<div style="${style} margin-bottom: 5px;">${line}</div>`
                }).join('')
            } else {
                // Develop questions
                return text.split('\n').filter(l => l.trim().length > 0).map(line => {
                    // Bold score pattern logic
                    const scoreRegex = /(\(\s*\d+(?:[.,]\d+)?\s*(?:pts|puntos|ptos|p|punto)\.?\s*\))/i
                    const parts = line.split(scoreRegex)
                    const content = parts.map(part => {
                        if (scoreRegex.test(part)) return `<b>${part}</b>`
                        return part
                    }).join('')

                    const isBold = formatting.questionsBold ?? true
                    return `<div style="margin-bottom: 15px; ${isBold ? 'font-weight: bold;' : ''}">${content}</div>`
                }).join('')
            }
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: ${fontFamily}; color: #000; line-height: 1.5; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    td { padding: 5px; vertical-align: top; }
                    .header-table td { text-align: center; }
                    .info-table td { border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9; }
                    h1 { font-size: 24px; text-transform: uppercase; margin: 0; }
                    h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
                    .ra-item { display: inline-block; margin-right: 20px; }
                    .logo { max-height: 80px; width: auto; }
                </style>
            </head>
            <body>
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                    ${header.logoUrl ? `<img src="${header.logoUrl}" class="logo" style="max-height: 80px;" /><br/>` : ''}
                    <div style="margin-top: 10px;">
                        <h1>${header.subject}</h1>
                        <div style="font-size: 16px; color: #666; margin-top: 5px;">${header.course} - ${header.cycle}</div>
                    </div>
                </div>

                <!-- Info Grid -->
                <table class="info-table">
                    <tr>
                        <td><strong>Evaluación:</strong> ${header.evaluation}</td>
                        <td><strong>Fecha:</strong> ${header.date ? new Date(header.date).toLocaleDateString("es-ES") : ''}</td>
                    </tr>
                    <tr>
                         <td><strong>Duración:</strong> ${header.duration}</td>
                         <td><strong>RA Evaluados:</strong> ${header.raEvaluated.join(", ")}</td>
                    </tr>
                    ${(header.part1Percentage || header.part2Percentage) ? `
                    <tr>
                        <td>${header.part1Percentage ? `<strong>Parte 1 (Test):</strong> ${header.part1Percentage}` : ''}</td>
                        <td>${header.part2Percentage ? `<strong>Parte 2 (Desarrollo):</strong> ${header.part2Percentage}` : ''}</td>
                    </tr>` : ''}
                </table>

                <!-- Name Field -->
                <div style="margin-bottom: 20px;">
                    <strong>Nombre y Apellidos:</strong> _________________________________________________________________
                </div>

                <!-- RA Ratings -->
                <div style="margin-bottom: 20px;">
                    ${header.raEvaluated.map(ra =>
            `<span style="margin-right: 30px;"><strong>${ra}</strong> Calificación: ________</span>`
        ).join('')}
                    ${header.raEvaluated.length === 0 ? '<span><strong>Calificación:</strong> ________</span>' : ''}
                </div>

                <!-- Description -->
                ${header.description ? `<div style="font-style: italic; color: #666; border-left: 3px solid #ccc; padding-left: 10px; margin-bottom: 30px; white-space: pre-wrap;">${header.description}</div>` : ''}

                <!-- Sections -->
                ${sections.map((section, idx) => `
                    <div>
                        <h2>${idx + 1}. ${section.title} ${section.ra && section.ra.length > 0 ? `<span style="font-size: 12px; background: #eee; padding: 2px 6px; border-radius: 4px; font-weight: normal;">${section.ra.join(", ")}</span>` : ''}</h2>
                        
                        ${section.type === 'STANDARD' ? `<div style="white-space: pre-wrap;">${section.content || ''}</div>` : ''}
                        
                        ${section.type !== 'STANDARD' ? `<div>${formatQuestionsExport(section.questions || '', section.type === 'TEST')}</div>` : ''}
                    </div>
                `).join('')}
            </body>
            </html>
        `

        const blob = new Blob([htmlContent], { type: 'application/msword' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${header.subject || 'Examen'}.doc`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Bar */}
            <header className="bg-white border-b sticky top-0 z-10 print:hidden">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/fp-informatica/exams" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Generador de Exámenes</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select onValueChange={handleLoadTemplate} key={templates.length}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Cargar plantilla..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Plantilla
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Guardar como plantilla</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Nombre de la plantilla</Label>
                                        <Input
                                            value={newTemplateName}
                                            onChange={(e) => setNewTemplateName(e.target.value)}
                                            placeholder="Ej: Examen Final Diciembre"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveTemplate} disabled={!newTemplateName || isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={handleExportDoc} variant="secondary" className="bg-green-600 hover:bg-green-700 text-white">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar (Word)
                        </Button>

                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir / PDF
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:w-full">
                    {/* Editor Column (Left) - Hidden on print */}
                    <div className="space-y-6 print:hidden">
                        <ExamHeaderForm data={header} onChange={setHeader} />
                        <ExamSectionsBuilder sections={sections} onChange={setSections} />
                        <ExamFormattingForm data={formatting} onChange={setFormatting} />
                    </div>

                    {/* Preview Column (Right) - Full width on print */}
                    <div className="print:w-full print:absolute print:top-0 print:left-0">
                        <div className="sticky top-24 print:static">
                            <div className="mb-4 flex items-center justify-between print:hidden">
                                <h2 className="font-semibold text-gray-900">Vista Previa</h2>
                                <span className="text-sm text-gray-500">Se actualiza en tiempo real</span>
                            </div>
                            <ExamPreview header={header} sections={sections} formatting={formatting} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
