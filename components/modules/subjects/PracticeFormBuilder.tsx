'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Save, ArrowLeft, Loader2, FileText, Target, CalendarDays, BookOpen } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createSubjectPractice, updateSubjectPractice, PracticeInput } from "@/app/fp-informatica/subjects/actions"
import { toast } from "sonner"

interface PracticeFormBuilderProps {
    subjectId: string
    initialData?: PracticeInput
}

export function PracticeFormBuilder({ subjectId, initialData }: PracticeFormBuilderProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [data, setData] = useState<PracticeInput>(initialData || {
        title: "",
        subjectId: subjectId,
        date: undefined,
        objectives: "",
        description: ""
    })

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
            const result = data.id
                ? await updateSubjectPractice(data)
                : await createSubjectPractice(data)

            if (result.success) {
                toast.success(data.id ? "Práctica actualizada" : "Práctica creada")
                router.push(`/fp-informatica/subjects/${subjectId}`)
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

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {initialData ? "Editar Práctica" : "Nueva Práctica"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Configura los detalles de la práctica o entrega
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (2/3) */}
                <div className="lg:col-span-2 space-y-6">
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
                </div>

                {/* Sidebar (1/3) */}
                <div className="lg:col-span-1 space-y-6">
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
        </div>
    )
}
