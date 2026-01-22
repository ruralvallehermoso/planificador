'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Save, ArrowLeft, Loader2, FileText, Target, CalendarDays, Columns, PanelLeft, PanelRight, Printer } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createSubjectPractice, updateSubjectPractice, PracticeInput } from "@/app/fp-informatica/subjects/actions"
import { toast } from "sonner"
import { PracticeFormattingForm, PracticeFormatting, DEFAULT_PRACTICE_FORMATTING } from "./PracticeFormattingForm"

interface PracticeFormBuilderProps {
    subjectId: string
    initialData?: PracticeInput
}

export function PracticeFormBuilder({ subjectId, initialData }: PracticeFormBuilderProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split')
    const [data, setData] = useState<PracticeInput>(initialData || {
        title: "",
        subjectId: subjectId,
        date: undefined,
        objectives: "",
        description: ""
    })

    const [formatting, setFormatting] = useState<PracticeFormatting>(
        initialData?.formatting ? JSON.parse(initialData.formatting) : DEFAULT_PRACTICE_FORMATTING
    )

    // Migrate old default margin to new standard if detected on load
    useEffect(() => {
        if (formatting.marginSize === "p-[15mm]") {
            setFormatting(prev => ({ ...prev, marginSize: "p-[25mm]" }))
        }
    }, [])

    const handleChange = (field: keyof PracticeInput, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!data.title) {
            toast.error("El título es obligatorio")
            return
        }

        setIsSaving(true)
        try {
            const dataToSave = {
                ...data,
                formatting: JSON.stringify(formatting)
            }

            const result = data.id
                ? await updateSubjectPractice(dataToSave)
                : await createSubjectPractice(dataToSave)

            if (result.success) {
                toast.success(data.id ? "Práctica actualizada" : "Práctica creada")
                // router.push(`/fp-informatica/subjects/${subjectId}`)
                router.refresh()
            } else {
                toast.error("Error al guardar la práctica")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        } finally {
            setIsSaving(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    // Dynamic classes based on formatting
    const contentClasses = cn(
        formatting.font,
        formatting.fontSize,
        formatting.lineHeight,
        formatting.paragraphSpacing,
        "text-gray-900"
    )

    const titleClasses = cn(
        formatting.font,
        formatting.titleSize || "text-2xl",
        "uppercase tracking-tight",
        formatting.isBoldTitle && "font-bold",
        "text-slate-900"
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:pb-0">
            <style jsx global>{`
                @media print {
                    @page { margin: 25mm !important; }
                    body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; }
                    html { margin: 0 !important; padding: 0 !important; }
                    .print-container { padding: 0 !important; }
                }
            `}</style>
            {/* Header - Fixed position */}
            <header className="bg-white border-b z-50 print:hidden fixed top-0 left-0 right-0 shadow-sm">
                <div className="w-full max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900 hidden md:block">
                            {initialData ? "Editar Práctica" : "Nueva Práctica"}
                        </h1>

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
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handlePrint} variant="outline" className="hidden sm:flex">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1800px] mx-auto px-4 pt-20 pb-8 print:p-0 print:pt-0">
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
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h2 className="font-semibold text-gray-900">Información General</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título de la Práctica</Label>
                                    <Input
                                        placeholder="Ej: Práctica 1: Configuración de Redes"
                                        value={data.title}
                                        onChange={(e) => handleChange("title", e.target.value)}
                                        className="text-lg font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción y Enunciado</Label>
                                    <div className="border rounded-md min-h-[300px]">
                                        <RichTextEditor
                                            value={data.description || ""}
                                            onChange={(html) => handleChange("description", html)}
                                            placeholder="Describe los pasos a seguir de la práctica..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formatting Controls */}
                        <PracticeFormattingForm
                            data={formatting}
                            onChange={setFormatting}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Objectives Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
                                    <Target className="w-5 h-5 text-emerald-600" />
                                    <h2 className="font-semibold text-gray-900">Objetivos</h2>
                                </div>
                                <div className="min-h-[200px] border rounded-md bg-gray-50/50">
                                    <RichTextEditor
                                        value={data.objectives || ""}
                                        onChange={(html) => handleChange("objectives", html)}
                                        placeholder="Lista los objetivos de aprendizaje..."
                                        className="min-h-[200px]"
                                    />
                                </div>
                            </div>

                            {/* Delivery Settings Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
                                    <CalendarDays className="w-5 h-5 text-purple-600" />
                                    <h2 className="font-semibold text-gray-900">Entrega</h2>
                                </div>

                                <div className="space-y-2">
                                    <Label>Fecha Límite</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !data.date && "text-muted-foreground"
                                                )}
                                            >
                                                {data.date ? (
                                                    format(new Date(data.date), "PPP", { locale: es })
                                                ) : (
                                                    <span>Seleccionar fecha</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[9999] bg-white" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={data.date ? new Date(data.date) : undefined}
                                                onSelect={(date) => handleChange("date", date ? date.toISOString() : undefined)}
                                                locale={es}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Column (Right) */}
                    <div className={cn(
                        "print:w-full print:static h-full transition-all duration-300",
                        viewMode === 'editor' ? "hidden" : "block",
                        viewMode === 'preview' ? "max-w-[210mm] mx-auto" : ""
                    )}>
                        <div className={cn(
                            "bg-white shadow-xl shadow-gray-200/50 min-h-[297mm] print:shadow-none print:border-none print:rounded-none border border-gray-100 rounded-lg print-container",
                            formatting.marginSize || "p-[25mm]"
                        )}>
                            <div className="space-y-4">
                                {/* Preview Header */}
                                <div className="border-b-2 border-slate-800 pb-2 mb-2">
                                    <h1 className={titleClasses}>
                                        {data.title || "Título de la Práctica"}
                                    </h1>
                                </div>

                                {/* Preview Objectives */}
                                {data.objectives && (data.objectives !== "<p></p>") && (
                                    <div className={cn(
                                        "bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2",
                                        contentClasses
                                    )}>
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            Objetivos de Aprendizaje
                                        </h3>
                                        <div
                                            className="prose prose-sm prose-slate max-w-none [&>p]:m-0 [&>ul]:m-0 [&>li]:m-0"
                                            dangerouslySetInnerHTML={{ __html: data.objectives }}
                                        />
                                    </div>
                                )}

                                {/* Preview Content */}
                                <div className={cn("prose prose-slate max-w-none", contentClasses)}>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b pb-2">
                                        Enunciado
                                    </h3>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: data.description || "<p class='text-gray-400 italic'>Sin descripción...</p>" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
