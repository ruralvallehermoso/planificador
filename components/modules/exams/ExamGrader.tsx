"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExamSection } from "@/lib/actions/exams"
import { Calculator, Save, AlertCircle, Settings2, RefreshCcw } from "lucide-react"

interface GradingRules {
    testPointsPerQuestion: number
    testPenaltyPerError: number
    testMaxScore: number
}

interface ExamGraderProps {
    sections: ExamSection[]
    gradingRules: GradingRules
    onGradingChange?: (rules: GradingRules) => void
    part1Weight?: number // 0-100
    part2Weight?: number // 0-100
    onWeightsChange?: (p1: number, p2: number) => void
}

export function ExamGrader({
    sections,
    gradingRules,
    onGradingChange,
    part1Weight = 50,
    part2Weight = 50,
    onWeightsChange
}: ExamGraderProps) {

    // Auto-detect questions
    const detectedQuestions = sections
        .filter(s => s.type === 'TEST')
        .reduce((acc, s) => {
            if (!s.questions) return acc
            return acc + s.questions.split('\n').filter(l => /^\d+[\.\)]/.test(l.trim())).length
        }, 0)

    // State
    const [customTotalQuestions, setCustomTotalQuestions] = useState<number | null>(null)
    const [testHits, setTestHits] = useState(0)
    const [testErrors, setTestErrors] = useState(0)
    const [manualScores, setManualScores] = useState<Record<string, number>>({})

    const totalQuestions = customTotalQuestions ?? detectedQuestions

    // Handlers for configuration changes
    const handleGradingChange = (field: keyof GradingRules, value: number) => {
        if (onGradingChange) {
            onGradingChange({
                ...gradingRules,
                [field]: value
            })
        }
    }

    const handleWeightChange = (p1: number) => {
        if (onWeightsChange) {
            onWeightsChange(p1, 100 - p1)
        }
    }

    // Computed
    const testUnanswered = Math.max(0, totalQuestions - testHits - testErrors)
    const rawTestScore = Math.max(0, (testHits * gradingRules.testPointsPerQuestion) - (testErrors * gradingRules.testPenaltyPerError))

    // Normalize to Max Score
    // If total questions is 0, avoid div by zero
    const maxPossibleRaw = totalQuestions * gradingRules.testPointsPerQuestion
    const finalTestGrade = maxPossibleRaw > 0
        ? (rawTestScore / maxPossibleRaw) * gradingRules.testMaxScore
        : 0

    const manualSections = sections.filter(s => s.type !== 'TEST')
    const totalManualScore = Object.values(manualScores).reduce((a, b) => a + b, 0)

    // Final Calculation: (TestScore * Weight) + ManualScore
    const part1Points = finalTestGrade * (part1Weight / 100)
    const finalGrade = part1Points + totalManualScore

    return (
        <div className="space-y-8">
            {/* Configuration Panel */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Configuración de Evaluación
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Preguntas Test</Label>
                        <Input
                            type="number"
                            min="1"
                            value={totalQuestions}
                            onChange={(e) => setCustomTotalQuestions(Number(e.target.value))}
                            className="h-8 bg-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Acierto (+)</Label>
                        <Input
                            type="number" step="0.1"
                            value={gradingRules.testPointsPerQuestion}
                            onChange={(e) => handleGradingChange('testPointsPerQuestion', parseFloat(e.target.value))}
                            className="h-8 bg-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Fallo (-)</Label>
                        <Input
                            type="number" step="0.1"
                            value={gradingRules.testPenaltyPerError}
                            onChange={(e) => handleGradingChange('testPenaltyPerError', parseFloat(e.target.value))}
                            className="h-8 bg-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Valor Test (%)</Label>
                        <Input
                            type="number"
                            value={part1Weight}
                            onChange={(e) => handleWeightChange(Number(e.target.value))}
                            className="h-8 bg-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Valor Desarr. (%)</Label>
                        <Input
                            type="number"
                            value={part2Weight}
                            onChange={(e) => {
                                const p2 = Number(e.target.value)
                                if (onWeightsChange) onWeightsChange(100 - p2, p2)
                            }}
                            className="h-8 bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setTestHits(0)
                        setTestErrors(0)
                        setManualScores({})
                    }}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Limpiar Entradas
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Part 1: Test Calculator */}
                <Card>
                    <div className="bg-purple-50 p-4 border-b flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                                <Calculator className="w-4 h-4" />
                                Parte 1: Test ({part1Weight}%)
                            </h3>
                            <span className="text-xs text-purple-600 mt-1">
                                {totalQuestions} preguntas · Max: {((gradingRules.testMaxScore * part1Weight) / 100).toFixed(2)} pts reales
                            </span>
                        </div>
                        <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            Base 10
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-green-600">Aciertos</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={totalQuestions}
                                    value={testHits}
                                    onChange={e => setTestHits(Number(e.target.value))}
                                    className="border-green-200 focus:ring-green-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-600">Fallos</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={totalQuestions}
                                    value={testErrors}
                                    onChange={e => setTestErrors(Number(e.target.value))}
                                    className="border-red-200 focus:ring-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">En blanco</Label>
                                <div className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                                    {testUnanswered}
                                </div>
                            </div>
                        </div>

                        {(testHits + testErrors) > totalQuestions && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                Suma de aciertos y fallos supera el total de preguntas ({totalQuestions}).
                            </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-1">
                            <div className="flex justify-between text-gray-500">
                                <span>Puntuación Directa:</span>
                                <span>{rawTestScore.toFixed(2)} / {maxPossibleRaw.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="font-bold text-gray-700">Nota Test (Ponderada):</span>
                            <span className="text-2xl font-bold text-purple-600">{part1Points.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Part 2: Manual Grading */}
                <Card>
                    <div className="bg-blue-50 p-4 border-b flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                                <Calculator className="w-4 h-4" />
                                Parte 2: Desarrollo
                            </h3>
                            <span className="text-xs text-blue-600 mt-1">Suma directa de puntos</span>
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        {manualSections.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No hay ejercicios de desarrollo.</p>
                        ) : (
                            manualSections.map((section, idx) => (
                                <div key={section.id || idx} className="flex items-center justify-between gap-4">
                                    <Label className="flex-1 truncate" title={section.title}>
                                        {idx + 1}. {section.title}
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="Nota"
                                        className="w-24 text-right"
                                        value={manualScores[section.id] || ''}
                                        onChange={e => setManualScores({ ...manualScores, [section.id]: Number(e.target.value) })}
                                    />
                                </div>
                            ))
                        )}

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-700">Total Desarrollo:</span>
                            <span className="text-2xl font-bold text-blue-600">{totalManualScore.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Final Result */}
            <Card className="bg-slate-900 text-white border-slate-800">
                <div className="p-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Nota Final</h2>
                        <p className="text-slate-400">
                            Test ({part1Points.toFixed(2)}) + Desarrollo ({totalManualScore.toFixed(2)})
                        </p>
                    </div>
                    <div className="text-5xl font-bold text-emerald-400">
                        {finalGrade.toFixed(2)}
                    </div>
                </div>
            </Card>
        </div>
    )
}
