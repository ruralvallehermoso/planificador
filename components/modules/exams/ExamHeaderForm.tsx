"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ExamHeaderData } from "@/lib/actions/exams"
import { ChangeEvent } from "react"

interface Props {
    data: ExamHeaderData
    onChange: (data: ExamHeaderData) => void
}

export function ExamHeaderForm({ data, onChange }: Props) {
    const handleChange = (field: keyof ExamHeaderData, value: string | string[]) => {
        onChange({ ...data, [field]: value })
    }

    const handleRaChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Split by comma and trim
        const values = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
        handleChange('raEvaluated', values)
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold border-b pb-2">1. Datos de Cabecera</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo (URL o Archivo)</Label>
                    <div className="flex gap-2">
                        <Input
                            id="logoUrl"
                            value={data.logoUrl || ''}
                            onChange={(e) => handleChange('logoUrl', e.target.value)}
                            placeholder="URL del logo..."
                        />
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                            handleChange('logoUrl', reader.result as string)
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                            />
                            <Button variant="outline" type="button" size="icon">
                                <span className="font-bold">↑</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="course">Curso</Label>
                    <Input
                        id="course"
                        value={data.course}
                        onChange={(e) => handleChange('course', e.target.value)}
                        placeholder="Ej: 1º"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cycle">Ciclo Formativo</Label>
                    <Input
                        id="cycle"
                        value={data.cycle}
                        onChange={(e) => handleChange('cycle', e.target.value)}
                        placeholder="Ej: DAM / DAW"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="evaluation">Evaluación</Label>
                    <Input
                        id="evaluation"
                        value={data.evaluation}
                        onChange={(e) => handleChange('evaluation', e.target.value)}
                        placeholder="Ej: 1ª Evaluación"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                        id="date"
                        type="date"
                        value={data.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duration">Duración</Label>
                    <Input
                        id="duration"
                        value={data.duration}
                        onChange={(e) => handleChange('duration', e.target.value)}
                        placeholder="Ej: 2 horas"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="subject">Asignatura / Módulo</Label>
                    <Input
                        id="subject"
                        value={data.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        placeholder="Ej: Programación"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ra">RAs Evaluados (separados por coma)</Label>
                    <Input
                        id="ra"
                        defaultValue={data.raEvaluated.join(', ')}
                        onChange={handleRaChange}
                        placeholder="RA1, RA2, RA4"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="desc">Instrucciones / Descripción</Label>
                    <Textarea
                        id="desc"
                        value={data.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Instrucciones generales para el examen..."
                        rows={3}
                    />
                </div>
            </div>
        </div>
    )
}
