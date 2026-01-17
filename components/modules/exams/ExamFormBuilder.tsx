"use client"

import { useState, useEffect } from "react"
import { ExamHeaderForm } from "./ExamHeaderForm"
import { ExamSectionsBuilder } from "./ExamSectionsBuilder"
import { ExamFormattingForm } from "./ExamFormattingForm"
import { ExamPreview } from "./ExamPreview"
import { ExamHeaderData, ExamSection, ExamFormatting, saveExamTemplate, getExamTemplates, deleteTemplate, ExamTemplateData, generateExamSolution } from "@/lib/actions/exams"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Save, Loader2, ArrowLeft, Download, Trash2, Settings2, Sparkles, Check, Copy, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
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
    const [isDeleting, setIsDeleting] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState("")
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false)
    const [activeTab, setActiveTab] = useState("preview")
    const [copiedSolution, setCopiedSolution] = useState(false)
    const [solutionHtml, setSolutionHtml] = useState("")

    const searchParams = useSearchParams()
    const router = useRouter()
    const urlTemplateId = searchParams.get('id')

    // Load templates on mount
    useEffect(() => {
        loadTemplates()
    }, [])

    const loadTemplates = async () => {
        const t = await getExamTemplates()
        setTemplates(t)

        // Auto-load template from URL if present and templates loaded
        if (urlTemplateId && t.length > 0) {
            const template = t.find((tmpl: any) => tmpl.id === urlTemplateId)
            if (template) {
                setSelectedTemplateId(urlTemplateId)
                setNewTemplateName(template.name)
                setHeader({
                    logoUrl: template.logoUrl || undefined,
                    cycle: template.cycle || "",
                    course: template.course || "",
                    evaluation: template.evaluation || "",
                    duration: template.duration || "",
                    date: template.date ? new Date(template.date).toISOString() : "",
                    subject: template.subject || "",
                    raEvaluated: JSON.parse(template.raEvaluated || "[]"),
                    description: template.description || "",
                    part1Percentage: template.part1Percentage || undefined,
                    part2Percentage: template.part2Percentage || undefined,
                })
                setSections(JSON.parse(template.sections))
                setFormatting(JSON.parse(template.formatting))
            }
        }
    }

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setSelectedTemplateId(templateId)
            setNewTemplateName(template.name) // Pre-fill name for potential edit
            setHeader({
                logoUrl: template.logoUrl || undefined,
                cycle: template.cycle || "",
                course: template.course || "",
                evaluation: template.evaluation || "",
                duration: template.duration || "",
                date: template.date ? new Date(template.date).toISOString() : "",
                subject: template.subject || "",
                raEvaluated: JSON.parse(template.raEvaluated || "[]"),
                description: template.description || "",
                part1Percentage: template.part1Percentage || undefined,
                part2Percentage: template.part2Percentage || undefined,
            })
            setSections(JSON.parse(template.sections))
            setFormatting(JSON.parse(template.formatting))
        }
    }

    const handleDeleteTemplate = async () => {
        if (!selectedTemplateId) return
        if (!confirm("¿Estás seguro de que quieres eliminar esta plantilla?")) return

        setIsDeleting(true)
        await deleteTemplate(selectedTemplateId)
        await loadTemplates()
        setSelectedTemplateId(null)
        setIsDeleting(false)
    }

    const handleSaveTemplate = async (asNew: boolean = false) => {
        if (!newTemplateName) return
        setIsSaving(true)
        const data: ExamTemplateData = {
            name: newTemplateName,
            header,
            sections,
            formatting
        }
        // If selectedTemplateId exists and not saving as new, update existing
        const idToUpdate = (selectedTemplateId && !asNew) ? selectedTemplateId : undefined

        const result = await saveExamTemplate(data, idToUpdate)

        if (result.success) {
            await loadTemplates()
            if (result.id) setSelectedTemplateId(result.id)
        }
        setIsSaving(false)
        setSaveDialogOpen(false)
        // Keep name if editing, otherwise clear? Actually better to keep purely for UX
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
                    /* Generic Table Styles */
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    td, th { padding: 5px; vertical-align: top; border: 1px solid #ccc; }
                    th { background-color: #2563eb; color: white; font-weight: bold; text-align: left; }
                    
                    /* Specific overrides for layout tables if needed */
                    .header-table td, .info-table td { border: none; } /* Reset for layout tables if they use generic tag */
                    .info-table td { border: 1px solid #ccc; background-color: #f9f9f9; }
                    .header-table td { text-align: center; border: none; background: none; }

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
                        
                        ${section.type === 'STANDARD' ?
                ((section.content || '').trim().startsWith('<') ?
                    `<div>${(section.content || '').replace(/(\(\s*\d+(?:[.,]\d+)?\s*(?:pts|puntos|ptos|p|punto)\.?\s*\))/gi, '<strong>$1</strong>')}</div>`
                    : `<div style="white-space: pre-wrap;">${section.content || ''}</div>`)
                : ''}
                        
                        ${section.type !== 'STANDARD' ?
                ((section.questions || '').trim().startsWith('<') ?
                    `<div>${(section.questions || '').replace(/(\(\s*\d+(?:[.,]\d+)?\s*(?:pts|puntos|ptos|p|punto)\.?\s*\))/gi, '<strong>$1</strong>')}</div>`
                    : `<div>${formatQuestionsExport(section.questions || '', section.type === 'TEST')}</div>`)
                : ''}
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


    const handleGenerateSolution = async () => {
        setIsGeneratingSolution(true)
        const data: ExamTemplateData = {
            name: newTemplateName || 'Borrador',
            header,
            sections,
            formatting
        }

        try {
            const result = await generateExamSolution(data)
            if (result.success && result.solution) {
                setSolutionHtml(result.solution)
                setActiveTab("solution")
            } else {
                alert("Error generando el solucionario: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("Error al conectar con Gemini")
        } finally {
            setIsGeneratingSolution(false)
            if (!isGeneratingSolution) { // simple check to avoid race conditions visually
                setActiveTab("solution")
            }
        }
    }

    const handleCopySolution = () => {
        const text = new DOMParser().parseFromString(solutionHtml, "text/html").body.textContent || ""
        navigator.clipboard.writeText(text)
        setCopiedSolution(true)
        setTimeout(() => setCopiedSolution(false), 2000)
    }

    const handlePrintSolution = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <html>
                <head>
                    <title>Solucionario: ${header.subject || 'Examen'}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                        strong { font-weight: bold; color: #000; }
                    </style>
                </head>
                <body>
                    <h1>Solucionario: ${header.subject || 'Examen'}</h1>
                    ${solutionHtml}
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Bar - removed sticky to prevent overlap */}
            <header className="bg-white border-b z-10 print:hidden relative shadow-sm">
                <div className="w-full max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/fp-informatica/exams" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Generador de Exámenes</h1>
                        {selectedTemplateId && (
                            <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Editando: {templates.find(t => t.id === selectedTemplateId)?.name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Select onValueChange={handleLoadTemplate} key={templates.length}>
                            <SelectTrigger className="w-[200px] border-slate-300">
                                <SelectValue placeholder="Cargar plantilla..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedTemplateId && (
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={handleDeleteTemplate}
                                disabled={isDeleting}
                                className="h-9 w-9"
                                title="Eliminar plantilla seleccionada"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        )}

                        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Save className="h-4 w-4 mr-2" />
                                    {selectedTemplateId ? 'Editar / Guardar' : 'Guardar Plantilla'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedTemplateId ? 'Guardar Cambios' : 'Guardar nueva plantilla'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {selectedTemplateId && (
                                        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                                            Estás editando la plantilla: <strong>{templates.find(t => t.id === selectedTemplateId)?.name}</strong>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>Nombre de la plantilla</Label>
                                        <Input
                                            value={newTemplateName}
                                            onChange={(e) => setNewTemplateName(e.target.value)}
                                            placeholder="Ej: Examen Final Diciembre"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="flex-col gap-2 sm:flex-row">
                                    {selectedTemplateId && (
                                        <Button
                                            onClick={() => handleSaveTemplate(true)}
                                            variant="outline"
                                            disabled={!newTemplateName || isSaving}
                                        >
                                            Guardar como nueva
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => handleSaveTemplate(false)}
                                        disabled={!newTemplateName || isSaving}
                                    >
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {selectedTemplateId ? 'Sobrescribir' : 'Guardar'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={handleExportDoc} variant="secondary" className="bg-green-600 hover:bg-green-700 text-white">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar (Word)
                        </Button>

                        <Button
                            onClick={handleGenerateSolution}
                            disabled={isGeneratingSolution || sections.length === 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isGeneratingSolution ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Solucionario IA
                        </Button>

                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir / PDF
                        </Button>
                    </div>
                </div>
            </header>



            <main className="w-full max-w-[1800px] mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:w-full">
                    {/* Editor Column (Left) - Hidden on print */}
                    <div className="space-y-6 print:hidden">
                        <ExamHeaderForm data={header} onChange={setHeader} />
                        <ExamSectionsBuilder sections={sections} onChange={setSections} />
                        <ExamFormattingForm data={formatting} onChange={setFormatting} />
                    </div>

                    {/* Preview Column (Right) - Full width on print */}
                    <div className="print:w-full print:absolute print:top-0 print:left-0 h-full">
                        <div className="print:static sticky top-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="mb-4 flex items-center justify-between print:hidden">
                                    <TabsList className="bg-gray-100">
                                        <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Vista Previa</TabsTrigger>
                                        <TabsTrigger value="solution" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <Sparkles className="h-3 w-3 mr-2 text-purple-600" />
                                            Solucionario
                                        </TabsTrigger>
                                    </TabsList>
                                    <span className="text-sm text-gray-500 hidden sm:block">
                                        {activeTab === 'preview' ? 'Se actualiza en tiempo real' : 'Generado por IA'}
                                    </span>
                                </div>

                                <TabsContent value="preview" className="mt-0 outline-none">
                                    <ExamPreview header={header} sections={sections} formatting={formatting} />
                                </TabsContent>

                                <TabsContent value="solution" className="mt-0 outline-none">
                                    <div className="bg-white p-8 shadow-lg min-h-[500px] rounded-lg border border-purple-100">
                                        {solutionHtml ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between border-b pb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-purple-900 flex items-center gap-2">
                                                            <Sparkles className="h-5 w-5 text-purple-600" />
                                                            Solucionario Generado
                                                        </h3>
                                                        <p className="text-sm text-gray-500">Basado en el contenido actual del examen</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={handleCopySolution}>
                                                            {copiedSolution ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
                                                            Copiar
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={handlePrintSolution}>
                                                            <Printer className="h-4 w-4 mr-2" />
                                                            Imprimir
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div
                                                    className="prose prose-sm max-w-none text-gray-800"
                                                    dangerouslySetInnerHTML={{ __html: solutionHtml }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-[400px] flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                                                <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center">
                                                    <Sparkles className="h-8 w-8 text-purple-300" />
                                                </div>
                                                <div className="max-w-xs mx-auto">
                                                    <h3 className="font-semibold text-gray-900 mb-1">Sin Solucionario</h3>
                                                    <p className="text-sm">Genera una propuesta de resolución y corrección para este examen utilizando IA.</p>
                                                </div>
                                                <Button
                                                    onClick={handleGenerateSolution}
                                                    disabled={isGeneratingSolution || sections.length === 0}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    {isGeneratingSolution ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                                    Generar Solucionario Ahora
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
