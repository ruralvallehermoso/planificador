'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { updateSubjectTopic, TopicInput } from "@/app/fp-informatica/subjects/actions"
import { toast } from "sonner"

interface EditTopicFormProps {
    topic: TopicInput
}

export function EditTopicForm({ topic }: EditTopicFormProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [data, setData] = useState<TopicInput>(topic)

    const handleChange = (field: keyof TopicInput, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!data.title) {
            toast.error("El título es obligatorio")
            return
        }

        setIsSaving(true)
        try {
            const result = await updateSubjectTopic(data)
            if (result.success) {
                toast.success("Tema actualizado correctamente")
                router.push(`/fp-informatica/subjects/${topic.subjectId}`)
                router.refresh()
            } else {
                toast.error("Error al actualizar el tema")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Editar Tema</h1>
                </div>
                <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="space-y-2">
                    <Label>Título del Tema</Label>
                    <Input
                        value={data.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Ej: Introducción a Bases de Datos"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Enlace a Materiales (Opcional)</Label>
                    <Input
                        value={data.materialLink || ""}
                        onChange={(e) => handleChange("materialLink", e.target.value)}
                        placeholder="https://drive.google.com/..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Orden</Label>
                    <Input
                        type="number"
                        value={data.order}
                        onChange={(e) => handleChange("order", parseInt(e.target.value))}
                        className="w-32"
                    />
                </div>
            </div>
        </div>
    )
}
