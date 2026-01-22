import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ExamHeaderData } from "@/lib/actions/exams"
import { CalendarIcon, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


interface GradingRules {
    testPointsPerQuestion: number
    testPenaltyPerError: number
    testMaxScore: number
}

interface ExamHeaderFormProps {
    data: ExamHeaderData
    grading: GradingRules
    onChange: (data: ExamHeaderData) => void
    onGradingChange: (data: GradingRules) => void
}

export function ExamHeaderForm({ data, grading, onChange, onGradingChange }: ExamHeaderFormProps) {
    const handleChange = (field: keyof ExamHeaderData, value: any) => {
        onChange({ ...data, [field]: value })
    }

    const handleGradingChange = (field: keyof GradingRules, value: number) => {
        onGradingChange({ ...grading, [field]: value })
    }

    const handleRAChange = (value: string) => {
        const ras = value.split(",").map(s => s.trim()).filter(s => s)
        handleChange("raEvaluated", ras)
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Cabecera del Examen</h2>

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
                            const rules: Partial<GradingRules> = {}
                            const headerUpdates: Partial<ExamHeaderData> = {}

                            // 1. Test Percentage
                            const testPctMatch = desc.match(/Test\s*(\d+)%/i) || desc.match(/Parte 1[:\s]*(\d+)%/i)
                            if (testPctMatch) {
                                headerUpdates.part1Percentage = testPctMatch[1] + "%"
                                headerUpdates.part2Percentage = (100 - parseInt(testPctMatch[1])) + "%"
                            }

                            // 2. Points per Question
                            const pointsMatch = desc.match(/(\d+(?:[.,]\d+)?)\s*punt(?:os|o)?\s*por\s*acierto/i)
                            if (pointsMatch) rules.testPointsPerQuestion = parseFloat(pointsMatch[1].replace(',', '.'))

                            // 3. Penalty
                            const penaltyMatch = desc.match(/(\d+(?:[.,]\d+)?)\s*penaliza(?:ción)?/i) || desc.match(/resta\s*(\d+(?:[.,]\d+)?)/i)
                            if (penaltyMatch) rules.testPenaltyPerError = parseFloat(penaltyMatch[1].replace(',', '.'))

                            // Apply
                            if (Object.keys(headerUpdates).length > 0) onChange({ ...data, ...headerUpdates })
                            if (Object.keys(rules).length > 0) onGradingChange({ ...grading, ...rules })
                        }}
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Autocompletar
                    </Button>
                </div>
                <Textarea
                    value={data.description}
                    onChange={e => handleChange("description", e.target.value)}
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
                <Label className="text-purple-700 font-semibold mb-3 block">Reglas de Calificación (Test)</Label>
                <div className="grid grid-cols-3 gap-4 bg-purple-50 p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label className="text-xs">Puntos por Acierto</Label>
                        <Input
                            type="number"
                            step="0.1"
                            value={grading.testPointsPerQuestion}
                            onChange={e => handleGradingChange("testPointsPerQuestion", parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Penalización Error</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={grading.testPenaltyPerError}
                            onChange={e => handleGradingChange("testPenaltyPerError", parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Nota Máxima Test</Label>
                        <Input
                            type="number"
                            step="0.1"
                            value={grading.testMaxScore}
                            onChange={e => handleGradingChange("testMaxScore", parseFloat(e.target.value))}
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
