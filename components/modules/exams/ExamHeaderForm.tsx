import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ExamHeaderData } from "@/lib/actions/exams"
import { CalendarIcon, Sparkles, FileText, Settings } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { AutoTestGradingRules } from "./grading-utils"


interface GradingRules {
    testPointsPerQuestion: number
    testPenaltyPerError: number
    testMaxScore: number
    testQuestionCount?: number | null
}

interface ExamHeaderFormProps {
    data: ExamHeaderData
    grading: GradingRules
    autoTestGrading: AutoTestGradingRules | null
    detectedTestQuestionCount: number
    onChange: (data: ExamHeaderData) => void
    onGradingChange: (data: GradingRules) => void
}

export function ExamHeaderForm({ data, grading, autoTestGrading, detectedTestQuestionCount, onChange, onGradingChange }: ExamHeaderFormProps) {
    const handleChange = <K extends keyof ExamHeaderData>(field: K, value: ExamHeaderData[K]) => {
        onChange({ ...data, [field]: value })
    }

    const handleRAChange = (value: string) => {
        const ras = value.split(",").map(s => s.trim()).filter(s => s)
        handleChange("raEvaluated", ras)
    }

    const formatAutoValue = (value: number | undefined) => (
        autoTestGrading && value !== undefined ? value.toFixed(2) : ""
    )

    const handleQuestionCountChange = (value: string) => {
        const parsedValue = Number.parseInt(value, 10)
        onGradingChange({
            ...grading,
            testQuestionCount: Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
        })
    }

    return (
        <div className="space-y-6 bg-white p-8 rounded-2xl shadow-md border-l-4 border-l-indigo-400 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between border-b pb-4 mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Cabecera del Examen</h2>
                </div>
                <div className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                    Configuración
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Módulo / Asignatura</Label>
                    <Input value={data.subject} onChange={e => handleChange("subject", e.target.value)} placeholder="Ej: Desarrollo Web Entorno Cliente" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Ciclo</Label>
                        <Input value={data.cycle} onChange={e => handleChange("cycle", e.target.value)} placeholder="Ej: DAW" />
                    </div>
                    <div className="space-y-2">
                        <Label>Curso</Label>
                        <Input value={data.course} onChange={e => handleChange("course", e.target.value)} placeholder="Ej: 2º" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Evaluación</Label>
                    <Input value={data.evaluation} onChange={e => handleChange("evaluation", e.target.value)} placeholder="Ej: 1ª Evaluación" />
                </div>
                <div className="space-y-2">
                    <Label>Duración</Label>
                    <Input value={data.duration} onChange={e => handleChange("duration", e.target.value)} placeholder="Ej: 2 horas" />
                </div>
                <div className="space-y-2 flex flex-col">
                    <Label className="mb-2">Fecha</Label>
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
                                onSelect={(date) => handleChange("date", date ? date.toISOString() : "")}
                                locale={es}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Resultados de Aprendizaje (separados por comas)</Label>
                <Input value={data.raEvaluated.join(", ")} onChange={e => handleRAChange(e.target.value)} placeholder="RA1, RA2, RA3..." />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-baseline mb-2">
                    <Label>Instrucciones / Descripción</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => {
                            const desc = data.description || ""
                            // Parse Logic
                            const headerUpdates: Partial<ExamHeaderData> = {}

                            // 1. Test Percentage
                            const testPctMatch = desc.match(/Test\s*(\d+)%/i) || desc.match(/Parte 1[:\s]*(\d+)%/i)
                            if (testPctMatch) {
                                headerUpdates.part1Percentage = testPctMatch[1] + "%"
                                headerUpdates.part2Percentage = (100 - parseInt(testPctMatch[1])) + "%"
                            }

                            // Apply
                            if (Object.keys(headerUpdates).length > 0) onChange({ ...data, ...headerUpdates })
                        }}
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Autocompletar
                    </Button>
                </div>
                <Textarea
                    value={data.description}
                    onChange={e => handleChange("description", e.target.value)}
                    onBlur={() => {
                        if (autoTestGrading) {
                            const pointsStr = grading.testPointsPerQuestion.toFixed(2)
                            const penaltyStr = grading.testPenaltyPerError.toFixed(2)
                            const currentDesc = data.description || ""
                            let newDesc = currentDesc

                            const pointsRegex = /(correcta\s*\+\s*)\d+(?:[.,]\d+)?/gi
                            const penaltyRegex = /(err[óo]nea\s*-\s*)\d+(?:[.,]\d+)?/gi

                            let hasChanges = false
                            if (pointsRegex.test(currentDesc)) {
                                newDesc = newDesc.replace(pointsRegex, `$1${pointsStr}`)
                                hasChanges = true
                            }
                            if (penaltyRegex.test(currentDesc)) {
                                newDesc = newDesc.replace(penaltyRegex, `$1${penaltyStr}`)
                                hasChanges = true
                            }

                            if (hasChanges && newDesc !== currentDesc) {
                                handleChange("description", newDesc)
                            }
                        }
                    }}
                    placeholder="Instrucciones generales para el alumno..."
                    className="h-20"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                    <Label>Peso Parte 1 (Test %)</Label>
                    <Input value={data.part1Percentage || ''} onChange={e => handleChange("part1Percentage", e.target.value)} placeholder="Ej: 60%" />
                </div>
                <div className="space-y-2">
                    <Label>Peso Parte 2 (Desarrollo %)</Label>
                    <Input value={data.part2Percentage || ''} onChange={e => handleChange("part2Percentage", e.target.value)} placeholder="Ej: 40%" />
                </div>
            </div>

            <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-purple-600" />
                    <Label className="text-purple-700 font-bold">Reglas de Calificación (Test)</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                    <div className="space-y-2">
                        <Label className="text-xs">Preguntas Test</Label>
                        <Input
                            type="number"
                            min="1"
                            value={autoTestGrading ? autoTestGrading.questionCount : ""}
                            onChange={e => handleQuestionCountChange(e.target.value)}
                            placeholder={detectedTestQuestionCount > 0 ? String(detectedTestQuestionCount) : ""}
                            className="bg-white"
                        />
                        {grading.testQuestionCount && grading.testQuestionCount !== detectedTestQuestionCount && (
                            <p className="text-[11px] text-purple-600">Detectadas: {detectedTestQuestionCount}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Valor Total Test</Label>
                        <Input
                            readOnly
                            value={formatAutoValue(autoTestGrading?.testTotalPoints)}
                            className="bg-white/70"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Puntos por Acierto</Label>
                        <Input
                            readOnly
                            value={formatAutoValue(grading.testPointsPerQuestion)}
                            className="bg-white/70"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Penalización Error</Label>
                        <Input
                            readOnly
                            value={formatAutoValue(grading.testPenaltyPerError)}
                            className="bg-white/70"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={data.logoUrl || ''} onChange={e => handleChange("logoUrl", e.target.value)} placeholder="https://..." />
            </div>
        </div>
    )
}
