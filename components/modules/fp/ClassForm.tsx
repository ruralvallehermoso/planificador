'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClass, updateClass } from "@/lib/actions/classes"
import { Plus, Loader2, Pencil, Link as LinkIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ClassLink {
    title: string
    url: string
}

interface ClassData {
    id?: string
    title: string
    date: Date | string
    startTime?: string | null
    endTime?: string | null
    description?: string | null
    content?: string | null
    links?: ClassLink[]
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
    const [links, setLinks] = useState<ClassLink[]>(initialData?.links || [])

    const addLink = () => {
        setLinks([...links, { title: '', url: '' }])
    }

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index))
    }

    const updateLink = (index: number, field: keyof ClassLink, value: string) => {
        const newLinks = [...links]
        newLinks[index] = { ...newLinks[index], [field]: value }
        setLinks(newLinks)
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        formData.append('categoryId', categoryId)
        formData.append('links', JSON.stringify(links.filter(l => l.title && l.url))) // Only send valid links

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
            if (!isEditing) setLinks([]) // Reset links on new creation
        }
    }

    const defaultDate = initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : ''

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg rounded-full px-6">
                        <Plus className="w-5 h-5 mr-2" />
                        Nueva Clase
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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

                    {/* Resources Section */}
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Recursos (Drive / Links)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addLink}>
                                <Plus className="w-4 h-4 mr-2" /> Añadir Enlace
                            </Button>
                        </div>

                        {links.map((link, index) => (
                            <div key={index} className="flex items-start gap-2 bg-slate-50 p-2 rounded-md">
                                <div className="grid gap-2 flex-1">
                                    <Input
                                        placeholder="Título (ej: Diapositivas)"
                                        value={link.title}
                                        onChange={(e) => updateLink(index, 'title', e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                    <Input
                                        placeholder="URL (https://...)"
                                        value={link.url}
                                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                                        className="h-8 text-sm font-mono"
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'Actualizar Clase' : 'Guardar Clase'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
