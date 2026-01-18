'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClass, updateClass } from "@/lib/actions/classes"
import { Plus, Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface ClassData {
    id?: string
    title: string
    date: Date | string
    startTime?: string | null
    endTime?: string | null
    description?: string | null
    content?: string | null
    driveLink?: string | null
}

interface ClassFormProps {
    categoryId: string
    initialData?: ClassData
    trigger?: React.ReactNode
}

export function ClassForm({ categoryId, initialData, trigger }: ClassFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!initialData

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        formData.append('categoryId', categoryId)

        let result
        if (isEditing && initialData?.id) {
            result = await updateClass(initialData.id, formData)
        } else {
            result = await createClass(formData)
        }

        setIsLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(isEditing ? 'Clase actualizada' : 'Clase creada correctamente')
            setOpen(false)
        }
    }

    const defaultDate = initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : ''

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Clase
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Clase' : 'Añadir Nueva Clase'}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            placeholder="Ej: Introducción a React"
                            defaultValue={initialData?.title}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                defaultValue={defaultDate}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Inicio</Label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    defaultValue={initialData?.startTime || ''}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Fin</Label>
                                <Input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    defaultValue={initialData?.endTime || ''}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Breve descripción..."
                            defaultValue={initialData?.description || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Contenido</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Detalles, apuntes, resumen..."
                            className="min-h-[100px]"
                            defaultValue={initialData?.content || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="driveLink">Enlace a Drive</Label>
                        <Input
                            id="driveLink"
                            name="driveLink"
                            type="url"
                            placeholder="https://drive.google.com/..."
                            defaultValue={initialData?.driveLink || ''}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'Actualizar Clase' : 'Guardar Clase'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
