"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createFpEvaluation, updateFpEvaluation, FpEvaluationData } from "@/lib/actions/fp-evaluations"

interface EvaluationFormProps {
    initialData?: any
}

export function EvaluationForm({ initialData }: EvaluationFormProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<FpEvaluationData>({
        name: initialData?.name || "",
        cycle: initialData?.cycle || "DAM",
        subject: initialData?.subject || "",
        course: initialData?.course || "1º",
        evaluation: initialData?.evaluation || "1ª Evaluación",
        description: initialData?.description || "",
    })

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (initialData?.id) {
                const result = await updateFpEvaluation(initialData.id, formData)
                if (result.success) {
                    router.push(`/fp-informatica/evaluations`)
                } else {
                    alert("Error al actualizar la evaluación")
                }
            } else {
                const result = await createFpEvaluation(formData)
                if (result.success) {
                    router.push(`/fp-informatica/evaluations/${result.id}`)
                } else {
                    alert("Error al crear la evaluación")
                }
            }
        } catch (error) {
            console.error(error)
            alert("Error al guardar la evaluación")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/fp-informatica/evaluations" className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {initialData ? 'Editar Evaluación' : 'Nueva Evaluación Analítica'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {initialData ? 'Modifica los datos base de esta evaluación' : 'Define el plan formativo al que pertenecerán estas calificaciones.'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nombre Descriptivo</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Notas Finales BD (Dic)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Módulo (Asignatura)</Label>
                            <Input
                                id="subject"
                                value={formData.subject || ''}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Ej: Bases de Datos"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cycle" className="text-sm font-semibold text-gray-700">Ciclo Formativo</Label>
                            <div className="flex gap-2">
                                {['DAM', 'DAW', 'ASIR', 'SMR'].map(opt => (
                                    <Button
                                        key={opt}
                                        type="button"
                                        variant={formData.cycle === opt ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, cycle: opt })}
                                        className={formData.cycle === opt ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="course" className="text-sm font-semibold text-gray-700">Curso</Label>
                                <select
                                    id="course"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                >
                                    <option value="1º">1º</option>
                                    <option value="2º">2º</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="evaluation" className="text-sm font-semibold text-gray-700">Evaluación</Label>
                                <select
                                    id="evaluation"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.evaluation}
                                    onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
                                >
                                    <option value="1ª Evaluación">1ª</option>
                                    <option value="2ª Evaluación">2ª</option>
                                    <option value="3ª Evaluación">3ª</option>
                                    <option value="Final">Final</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Notas / Descripción (Opcional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Añade contexto adicional sobre esta evaluación..."
                            className="min-h-[100px] resize-y"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !formData.subject || !formData.name}
                        className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {initialData ? 'Guardar Cambios' : 'Crear y Continuar'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
