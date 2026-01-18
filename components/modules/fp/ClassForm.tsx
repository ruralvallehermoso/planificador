'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClass } from "@/lib/actions/classes"
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ClassFormProps {
    categoryId: string
}

export function ClassForm({ categoryId }: ClassFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        formData.append('categoryId', categoryId)

        const result = await createClass(formData)

        setIsLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Clase creada correctamente')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Clase
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nueva Clase</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" required placeholder="Ej: Introducción a React" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input id="date" name="date" type="date" required />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Inicio</Label>
                                <Input id="startTime" name="startTime" type="time" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Fin</Label>
                                <Input id="endTime" name="endTime" type="time" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" placeholder="Breve descripción..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Contenido</Label>
                        <Textarea id="content" name="content" placeholder="Detalles, apuntes, resumen..." className="min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="driveLink">Enlace a Drive</Label>
                        <Input id="driveLink" name="driveLink" type="url" placeholder="https://drive.google.com/..." />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Guardar Clase
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
