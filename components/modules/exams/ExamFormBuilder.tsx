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
        await saveExamTemplate(data)
        await loadTemplates()
        setIsSaving(false)
        setSaveDialogOpen(false)
        setNewTemplateName("")
    }

    const handlePrint = () => {
        window.print()
    }

    const handleExportDoc = () => {
        const element = document.getElementById('exam-document')
        if (!element) return

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>${header.subject || 'Examen'}</title>
                    <style>
                        body { font-family: sans-serif; }
                        h1 { font-size: 24px; font-weight: bold; }
                        h2 { font-size: 18px; font-weight: bold; margin-top: 20px; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .mb-4 { margin-bottom: 16px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        td { border: 1px solid #ccc; padding: 8px; }
                    </style>
                </head>
                <body>
                    ${element.innerHTML}
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
