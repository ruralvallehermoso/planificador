'use client'

import { useState } from "react"
import { Plus, Trash2, BookOpen, GraduationCap, Calendar, User } from "lucide-react"
import { createSubject, deleteSubject } from "@/lib/actions/master-subjects"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Subject {
    id: string
    name: string
    code?: string | null
    professor?: string | null
    credits: number
    semester: number
    status: string
    finalGrade?: number | null
}

interface SubjectListProps {
    initialSubjects: Subject[]
    categoryId: string
}

export function SubjectList({ initialSubjects, categoryId }: SubjectListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const data = {
                name: formData.get('name') as string,
                code: formData.get('code') as string,
                professor: formData.get('professor') as string,
                credits: Number(formData.get('credits')),
                semester: Number(formData.get('semester')),
            }

            const result = await createSubject(data, categoryId)

            if (result.success) {
                toast.success("Asignatura creada correctamente")
                setIsDialogOpen(false)
            } else {
                toast.error("Error al crear", { description: result.error })
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Estás seguro de que quieres eliminar esta asignatura?")) return

        const result = await deleteSubject(id)
        if (result.success) {
            toast.success("Asignatura eliminada")
        } else {
            toast.error("Error al eliminar", { description: result.error })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Asignaturas</h2>
                    <p className="text-slate-500 text-sm">Gestiona tu plan de estudios</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Asignatura
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Nueva Asignatura</DialogTitle>
                            <DialogDescription>
                                Añade los detalles de la asignatura del Máster.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nombre
                                </Label>
                                <Input id="name" name="name" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right">
                                    Código
                                </Label>
                                <Input id="code" name="code" className="col-span-3" placeholder="Ej: ASIG-01" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="professor" className="text-right">
                                    Profesor
                                </Label>
                                <Input id="professor" name="professor" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="credits" className="text-right">
                                    Créditos
                                </Label>
                                <Input id="credits" name="credits" type="number" step="0.5" defaultValue="6" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="semester" className="text-right">
                                    Semestre
                                </Label>
                                <Select name="semester" defaultValue="1">
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Semestre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1º Semestre</SelectItem>
                                        <SelectItem value="2">2º Semestre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Guardando..." : "Guardar Asignatura"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialSubjects.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">No hay asignaturas</h3>
                        <p className="max-w-sm mx-auto mt-2">Empieza añadiendo las asignaturas de tu máster para hacer seguimiento.</p>
                    </div>
                ) : (
                    initialSubjects.map(subject => (
                        <div key={subject.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                            <button
                                onClick={() => handleDelete(subject.id)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-50 rounded-full"
                                title="Eliminar asignatura"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="flex items-start justify-between mb-4 pr-8">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${subject.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                                    subject.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                    {subject.status === 'PASSED' ? 'Aprobada' :
                                        subject.status === 'IN_PROGRESS' ? 'En Curso' : 'Matriculada'}
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg text-slate-900 mb-1">{subject.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{subject.code || 'Sin código'}</p>

                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-slate-400" />
                                    {subject.professor || 'Profesor no asignado'}
                                </div>
                                <div className="flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-2 text-slate-400" />
                                    {subject.credits} Créditos ECTS
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                    Semestre {subject.semester}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
