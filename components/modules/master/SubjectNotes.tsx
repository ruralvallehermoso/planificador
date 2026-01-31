'use client'

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateSubjectNotes } from "@/lib/actions/master-subjects"
import { toast } from "sonner"
import { Save } from "lucide-react"

interface SubjectNotesProps {
    subjectId: string
    initialNotes: string | null
}

export function SubjectNotes({ subjectId, initialNotes }: SubjectNotesProps) {
    const [notes, setNotes] = useState(initialNotes || "")
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave() {
        setIsSaving(true)
        try {
            const result = await updateSubjectNotes(subjectId, notes)
            if (result.success) {
                toast.success("Notas guardadas")
            } else {
                toast.error("Error al guardar notas")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Cuaderno de Notas</h3>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="outline"
                    className="gap-2"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar"}
                </Button>
            </div>
            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe aquí tus apuntes, recordatorios o ideas sobre la asignatura..."
                className="min-h-[300px] font-mono text-sm leading-relaxed"
            />
        </div>
    )
}
