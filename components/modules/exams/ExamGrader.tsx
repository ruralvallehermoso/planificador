"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExamSection } from "@/lib/actions/exams"
import { Calculator, Save, AlertCircle } from "lucide-react"

interface GradingRules {
    testPointsPerQuestion: number
    testPenaltyPerError: number
    testMaxScore: number
}

interface ExamGraderProps {
    sections: ExamSection[]
    gradingRules: GradingRules
    part1Weight?: number // 0-100
    part2Weight?: number // 0-100
}

export function ExamGrader({ sections, gradingRules, part1Weight = 50, part2Weight = 50 }: ExamGraderProps) {
    // Calculate total questions from sections
    const totalDetectedQuestions = sections
        .filter(s => s.type === 'TEST')
        .reduce((acc, s) => {
            if (!s.questions) return acc
            return acc + s.questions.split('\n').filter(l => /^\d+[\.\)]/.test(l.trim())).length
        }, 0)

    // State
    const [testHits, setTestHits] = useState(0)
    const [testErrors, setTestErrors] = useState(0)
    const [manualScores, setManualScores] = useState<Record<string, number>>({})

    // Computed
    const testUnanswered = Math.max(0, totalDetectedQuestions - testHits - testErrors)
    const rawTestScore = Math.max(0, (testHits * gradingRules.testPointsPerQuestion) - (testErrors * gradingRules.testPenaltyPerError))

    // Normalize to Max Score
    const maxPossibleRaw = totalDetectedQuestions * gradingRules.testPointsPerQuestion
    const finalTestGrade = totalDetectedQuestions > 0
        ? (rawTestScore / maxPossibleRaw) * gradingRules.testMaxScore
        : 0

    const manualSections = sections.filter(s => s.type !== 'TEST')
    const totalManualScore = Object.values(manualScores).reduce((a, b) => a + b, 0)
    // Assuming manual score is direct points (e.g. out of 10 or whatever the user inputs)
    // We might need a "Max Score" for manual part to normalize, but for now let's assume the user inputs the normalized score or we sum them up.
    // Let's assume the "Part 2" grade is the sum of manual scores up to 10 ?? 
    // Or maybe we just sum them. Let's assume the sum is the grade out of 10 for simplicity unless specified.

    const finalGrade = (finalTestGrade * (part1Weight / 100)) + (totalManualScore * (part2Weight / 100))

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Part 1: Test Calculator */}
                <Card>
                    <div className="bg-purple-50 p-4 border-b flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                                <Calculator className="w-4 h-4" />
                                Parte 1: Test ({part1Weight}%)
                            </h3>
                            <span className="text-xs text-purple-600 mt-1">Detectadas: {totalDetectedQuestions} preguntas</span>
                        </div>
                        <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            Max: {gradingRules.testMaxScore} pts
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-green-600">Aciertos</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={totalDetectedQuestions}
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
                                    max={totalDetectedQuestions}
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

                        {(testHits + testErrors) > totalDetectedQuestions && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                Suma de aciertos y fallos supera el total de preguntas ({totalDetectedQuestions}).
                            </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-1">
                            <div className="flex justify-between text-gray-500">
                                <span>Puntuación Directa:</span>
                                <span>{rawTestScore.toFixed(2)} / {maxPossibleRaw.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="font-bold text-gray-700">Nota Test (0-{gradingRules.testMaxScore}):</span>
                            <span className="text-2xl font-bold text-purple-600">{finalTestGrade.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Part 2: Manual Grading */}
                <Card>
                    <div className="bg-blue-50 p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            Parte 2: Desarrollo ({part2Weight}%)
                        </h3>
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
                            <span className="font-bold text-gray-700">Nota Desarrollo:</span>
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
                        <p className="text-slate-400">Ponderada según los pesos establecidos</p>
                    </div>
                    <div className="text-5xl font-bold text-emerald-400">
                        {finalGrade.toFixed(2)}
                    </div>
                </div>
            </Card>
        </div>
    )
}
