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
import { Printer, Save, Loader2, ArrowLeft, Download, Trash2, Settings2, Sparkles, Check, Copy, AlertCircle, Calculator, PanelLeft, PanelRight, Columns } from "lucide-react"
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

export function ExamFormBuilder() {
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

    const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split')

    const searchParams = useSearchParams()
    // ... (rest of existing hooks)

    // ... (existing functions)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Bar */}
            <header className="bg-white border-b z-10 print:hidden relative shadow-sm">
                <div className="w-full max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/fp-informatica/exams" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 hidden md:block">Generador de Exámenes</h1>

                        {/* View Mode Toggles */}
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg border ml-4">
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

                        {selectedTemplateId && (
                            <span className="hidden xl:inline-block ml-4 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium truncate max-w-[200px]">
                                {templates.find(t => t.id === selectedTemplateId)?.name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* ... existing buttons ... */}
                        <Select onValueChange={handleLoadTemplate} key={templates.length}>
                            <SelectTrigger className="w-[180px] border-slate-300 hidden md:flex">
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
                                className="h-9 w-9 hidden md:flex"
                                title="Eliminar plantilla seleccionada"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        )}

                        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="hidden sm:flex">
                                    <Save className="h-4 w-4 mr-2" />
                                    {selectedTemplateId ? 'Guardar' : 'Guardar'}
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

                        <Button onClick={handleExportDoc} variant="secondary" className="bg-green-600 hover:bg-green-700 text-white hidden sm:flex">
                            <Download className="h-4 w-4 mr-2" />
                            <span className="hidden lg:inline">Exportar</span>
                        </Button>

                        <Button
                            onClick={handleGenerateSolution}
                            disabled={isGeneratingSolution || sections.length === 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white hidden sm:flex"
                        >
                            {isGeneratingSolution ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            <span className="hidden lg:inline">IA</span>
                        </Button>

                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Printer className="h-4 w-4 mr-2" />
                            <span className="hidden lg:inline">Imprimir</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1800px] mx-auto px-4 py-8">
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
                        viewMode === 'preview' ? "max-w-[210mm] mx-auto" : ""
                    )}>
                        <div className="print:static sticky top-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="mb-4 flex items-center justify-between print:hidden">
                                    <TabsList className="bg-gray-100">
                                        <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Vista Previa</TabsTrigger>
                                        <TabsTrigger value="solution" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <Sparkles className="h-3 w-3 mr-2 text-purple-600" />
                                            Solucionario
                                        </TabsTrigger>
                                        <TabsTrigger value="grading" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <Calculator className="h-3 w-3 mr-2 text-emerald-600" />
                                            Calificaciones
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

                                <TabsContent value="grading" className="mt-0 outline-none">
                                    <div className="bg-white p-8 shadow-lg min-h-[500px] rounded-lg border border-emerald-100">
                                        <div className="mb-6">
                                            <h3 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                                                <Calculator className="h-5 w-5 text-emerald-600" />
                                                Calculadora de Calificaciones
                                            </h3>
                                            <p className="text-sm text-gray-500">Calcula la nota final basada en los pesos y reglas definidas.</p>
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
                                        />
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
