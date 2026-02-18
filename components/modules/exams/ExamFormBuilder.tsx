"use client"

import { useState, useEffect } from "react"
import { ExamHeaderForm } from "./ExamHeaderForm"
import { ExamSectionsBuilder } from "./ExamSectionsBuilder"
import { ExamFormattingForm } from "./ExamFormattingForm"
import { ExamPreview } from "./ExamPreview"
import { ExamGrader } from "./ExamGrader"
import { ExamHeaderData, ExamSection, ExamFormatting, saveExamTemplate, getExamTemplates, deleteTemplate, ExamTemplateData, generateExamSolution } from "@/lib/actions/exams"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Save, Loader2, ArrowLeft, Download, Trash2, Settings2, Sparkles, Check, Copy, AlertCircle, Calculator, PanelLeft, PanelRight, Columns, BookOpen } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const DEFAULT_HEADER: ExamHeaderData = {
    cycle: "", course: "", evaluation: "", duration: "", date: "",
    subject: "", raEvaluated: [], description: ""
}

const DEFAULT_FORMATTING: ExamFormatting = {
    font: "font-sans", fontSize: "text-base", isBoldTitle: true,
    lineHeight: "leading-normal", paragraphSpacing: "space-y-4"
}

interface GradingRules {
    testPointsPerQuestion: number
    testPenaltyPerError: number
    testMaxScore: number
}

const DEFAULT_GRADING: GradingRules = {
    testPointsPerQuestion: 1.0,
    testPenaltyPerError: 0.33,
    testMaxScore: 10.0
}

interface ExamFormBuilderProps {
    initialData?: any
}

export function ExamFormBuilder({ initialData }: ExamFormBuilderProps) {
    const [header, setHeader] = useState<ExamHeaderData>(DEFAULT_HEADER)
    const [sections, setSections] = useState<ExamSection[]>([])
    const [formatting, setFormatting] = useState<ExamFormatting>(DEFAULT_FORMATTING)
    const [grading, setGrading] = useState<GradingRules>(DEFAULT_GRADING)
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
    const [manualSolution, setManualSolution] = useState("") // NotebookLM/Manual content

    // Panel Visibility States
    const [showGrading, setShowGrading] = useState(false)
    const [showNotebook, setShowNotebook] = useState(false)

    // Grader Persistence State
    const [gradingValues, setGradingValues] = useState<{ hits: number, errors: number, manualScores: Record<string, number> }>({
        hits: 0,
        errors: 0,
        manualScores: {}
    })

    const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split')

    const searchParams = useSearchParams()
    const router = useRouter()
    const urlTemplateId = searchParams.get('id')

    // Load templates on mount
    useEffect(() => {
        loadTemplates()
    }, [])

    // Initialize with initialData if provided
    useEffect(() => {
        if (initialData) {
            loadTemplateData(initialData)
        }
    }, [initialData])

    // Sync validation with URL ID
    useEffect(() => {
        if (urlTemplateId && templates.length > 0 && !initialData && !selectedTemplateId) {
            const template = templates.find((tmpl: any) => tmpl.id === urlTemplateId)
            if (template) {
                loadTemplateData(template)
            }
        }
    }, [urlTemplateId, templates, initialData, selectedTemplateId])

    const loadTemplates = async () => {
        const t = await getExamTemplates()
        setTemplates(t)
    }

    const loadTemplateData = (template: any) => {
        setSelectedTemplateId(template.id)
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
        setGrading({
            testPointsPerQuestion: template.testPointsPerQuestion ?? 1.0,
            testPenaltyPerError: template.testPenaltyPerError ?? 0.33,
            testMaxScore: template.testMaxScore ?? 10.0
        })
        setManualSolution(template.manualSolution || "")
    }

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            loadTemplateData(template)
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
            formatting,
            grading,
            manualSolution
        }
        // If selectedTemplateId exists and not saving as new, update existing
        const idToUpdate = (selectedTemplateId && !asNew) ? selectedTemplateId : undefined

        const result = await saveExamTemplate(data, idToUpdate)

        if (result.success) {
            // Reload list to get updated names/IDs
            const t = await getExamTemplates()
            setTemplates(t)

            if (result.id) {
                setSelectedTemplateId(result.id)
                // If it's a new template or ID changed, update URL to the DETAIL page
                if (result.id !== urlTemplateId) {
                    router.push(`/fp-informatica/exams/${result.id}`)
                }
            }
        }
        setIsSaving(false)
        setSaveDialogOpen(false)
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
            formatting,
            grading
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

    // Helper to parse weights
    const getWeights = () => {
        const w1 = parseFloat(header.part1Percentage?.replace('%', '') || '50')
        const w2 = parseFloat(header.part2Percentage?.replace('%', '') || '50')
        // Normalize if NaN
        return {
            p1: isNaN(w1) ? 50 : w1,
            p2: isNaN(w2) ? 50 : w2
        }
    }

    const weights = getWeights()

    return (
        <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:pb-0">
            {/* Top Bar */}
            <header className="bg-white border-b z-10 print:hidden relative shadow-sm">
                {/* Row 1: Navigation + Title + View Mode */}
                <div className="w-full max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/fp-informatica/exams" className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900 truncate">Generador de Exámenes</h1>

                        {selectedTemplateId && (
                            <span className="hidden lg:inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium truncate max-w-[200px]">
                                {templates.find(t => t.id === selectedTemplateId)?.name}
                            </span>
                        )}
                    </div>

                    {/* View Mode Toggles */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg border shrink-0">
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => setViewMode('editor')}
                            className={cn("h-7 px-2", viewMode === 'editor' && "bg-white shadow text-blue-600")}
                            title="Solo Editor"
                        >
                            <PanelLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => setViewMode('split')}
                            className={cn("h-7 px-2", viewMode === 'split' && "bg-white shadow text-blue-600")}
                            title="Dividido"
                        >
                            <Columns className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => setViewMode('preview')}
                            className={cn("h-7 px-2", viewMode === 'preview' && "bg-white shadow text-blue-600")}
                            title="Solo Vista Previa"
                        >
                            <PanelRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Row 2: Actions */}
                <div className="w-full max-w-[1800px] mx-auto px-4 pb-2 flex flex-wrap items-center gap-2">
                    <Select onValueChange={handleLoadTemplate} key={templates.length}>
                        <SelectTrigger className="w-[160px] h-8 text-xs border-slate-300">
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
                            size="sm"
                            onClick={handleDeleteTemplate}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0"
                            title="Eliminar plantilla seleccionada"
                        >
                            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                    )}

                    <div className="w-px h-5 bg-gray-200 hidden sm:block" />

                    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                <Save className="h-3.5 w-3.5 mr-1.5" />
                                Guardar
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

                    <Button onClick={handleExportDoc} size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Exportar
                    </Button>

                    <Button
                        onClick={handleGenerateSolution}
                        disabled={isGeneratingSolution || sections.length === 0}
                        size="sm"
                        className="h-8 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isGeneratingSolution ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                        IA
                    </Button>

                    <Button onClick={handlePrint} size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="h-3.5 w-3.5 mr-1.5" />
                        Imprimir
                    </Button>
                </div>
            </header>

            <main className="w-full max-w-[1800px] mx-auto px-4 py-8 print:p-0">
                <div className={cn(
                    "grid gap-8 print:block print:w-full transition-all duration-300",
                    viewMode === 'split' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                )}>
                    {/* Editor Column (Left) */}
                    <div className={cn(
                        "space-y-6 print:hidden transition-all duration-300",
                        viewMode === 'preview' ? "hidden" : "block",
                        viewMode === 'editor' ? "max-w-3xl mx-auto w-full" : ""
                    )}>
                        <ExamHeaderForm
                            data={header}
                            onChange={setHeader}
                            grading={grading}
                            onGradingChange={setGrading}
                        />
                        <ExamSectionsBuilder sections={sections} onChange={setSections} />
                        <ExamFormattingForm data={formatting} onChange={setFormatting} />
                    </div>

                    {/* Preview Column (Right) */}
                    <div className={cn(
                        "print:w-full print:static h-full transition-all duration-300",
                        viewMode === 'editor' ? "hidden" : "block",
                        viewMode === 'preview' ? ((showNotebook || showGrading) ? "max-w-[95vw] mx-auto" : "max-w-[210mm] mx-auto") : ""
                    )}>
                        <div className="print:static sticky top-6 space-y-4">

                            {/* Tools Toolbar */}
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 mb-4 print:hidden">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2 mr-2">Herramientas:</span>
                                <Button
                                    variant={showGrading ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setShowGrading(!showGrading)}
                                    className={cn("gap-2", showGrading && "bg-emerald-100 text-emerald-800 hover:bg-emerald-200")}
                                >
                                    <Calculator className="h-4 w-4" />
                                    Calculadora
                                </Button>
                                <Button
                                    variant={showNotebook ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setShowNotebook(!showNotebook)}
                                    className={cn("gap-2", showNotebook && "bg-orange-100 text-orange-800 hover:bg-orange-200")}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Manual / NotebookLM
                                </Button>
                            </div>

                            <div className={cn(
                                "grid gap-6 transition-all duration-300",
                                (showGrading && showNotebook) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                            )}>

                                {/* Grading Panel */}
                                {showGrading && (
                                    <div className="bg-white p-6 shadow-lg rounded-lg border border-emerald-100 animate-in slide-in-from-top-2 h-fit">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                                                <Calculator className="h-5 w-5 text-emerald-600" />
                                                Calculadora de Calificaciones
                                            </h3>
                                            <Button variant="ghost" size="sm" onClick={() => setShowGrading(false)}><ArrowLeft className="h-4 w-4 rotate-90" /></Button>
                                        </div>
                                        <ExamGrader
                                            sections={sections}
                                            gradingRules={grading}
                                            onGradingChange={setGrading}
                                            part1Weight={weights.p1}
                                            part2Weight={weights.p2}
                                            onWeightsChange={(p1, p2) => setHeader(prev => ({
                                                ...prev,
                                                part1Percentage: p1 + '%',
                                                part2Percentage: p2 + '%'
                                            }))}
                                            gradingValues={gradingValues}
                                            onQuestionValuesChange={setGradingValues}
                                        />
                                    </div>
                                )}

                                {/* Notebook Panel */}
                                {showNotebook && (
                                    <div className="bg-white p-6 shadow-lg rounded-lg border border-orange-100 animate-in slide-in-from-top-2 h-fit">
                                        <div className="mb-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5 text-orange-600" />
                                                    Solución Manual / NotebookLM
                                                </h3>
                                                <p className="text-sm text-gray-500">Pega aquí el contenido generado por NotebookLM u otra fuente.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    const printWindow = window.open('', '_blank')
                                                    if (!printWindow) return
                                                    printWindow.document.write(`
                                                        <html>
                                                            <head>
                                                                <title>Solucionario: ${header.subject || 'Examen'}</title>
                                                                <style>
                                                                    body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                                                                    h1 { color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px; }
                                                                    strong { font-weight: bold; color: #000; }
                                                                    h2, h3 { color: #333; margin-top: 20px; }
                                                                    ul { padding-left: 20px; }
                                                                    li { margin-bottom: 5px; }
                                                                    code { background: #f3f4f6; padding: 2px 4px; rounded: 4px; font-family: monospace; }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <h1>Solucionario: ${header.subject || 'Examen'}</h1>
                                                                <div style="white-space: pre-wrap;">${manualSolution}</div>
                                                                <script>window.onload = () => { window.print(); window.close(); }</script>
                                                            </body>
                                                        </html>
                                                    `)
                                                    printWindow.document.close()
                                                }}>
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Imprimir
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setShowNotebook(false)}><ArrowLeft className="h-4 w-4 rotate-90" /></Button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="notebook-input" className="text-orange-800">Pegar Contenido</Label>
                                                <textarea
                                                    id="notebook-input"
                                                    className="flex min-h-[150px] w-full rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm placeholder:text-orange-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="Pega aquí el texto extraído de NotebookLM..."
                                                    value={manualSolution}
                                                    onChange={(e) => setManualSolution(e.target.value)}
                                                />
                                            </div>

                                            {manualSolution && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-orange-800 font-medium">
                                                        <Sparkles className="h-4 w-4" />
                                                        Vista Previa Formateada
                                                    </div>
                                                    <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-inner prose prose-sm max-w-none prose-orange">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm, remarkMath]}
                                                            rehypePlugins={[rehypeKatex]}
                                                            components={{
                                                                table: ({ node, ...props }) => <table className="w-full border-collapse border border-gray-300 my-4" {...props} />,
                                                                th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-bold text-left" {...props} />,
                                                                td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                                                                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-800" {...props} />,
                                                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2 text-orange-800" {...props} />,
                                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-orange-700" {...props} />,
                                                                h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-5 mb-2 text-gray-900" {...props} />,
                                                            }}
                                                        >
                                                            {manualSolution}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="mb-4 flex items-center justify-between print:hidden">
                                    <TabsList className="bg-gray-100">
                                        <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Vista Previa</TabsTrigger>
                                        <TabsTrigger value="solution" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <Sparkles className="h-3 w-3 mr-2 text-purple-600" />
                                            Solucionario IA
                                        </TabsTrigger>
                                    </TabsList>
                                    {/* ... existing span ... */}
                                </div>

                                <TabsContent value="preview" className="mt-0 outline-none">
                                    <ExamPreview header={header} sections={sections} formatting={formatting} />
                                </TabsContent>
                                {/* ... other tabs ... */}
                                <TabsContent value="solution" className="mt-0 outline-none">
                                    <div className="bg-white p-8 shadow-lg min-h-[500px] rounded-lg border border-purple-100">
                                        {/* ... solution content ... */}
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
            </main >
        </div >
    )
}
