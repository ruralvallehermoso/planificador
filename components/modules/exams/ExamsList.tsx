"use client"

import Link from "next/link"
import { ArrowLeft, Plus, FileText, Calendar, Clock, MoreVertical, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteTemplate } from "@/lib/actions/exams"
import { useRouter } from "next/navigation"
import { useState } from "react"


interface ExamTemplate {
    id: string
    name: string
    subject?: string | null
    course?: string | null
    date?: string | null
    createdAt: Date
    updatedAt: Date
}

interface ExamsListProps {
    templates: ExamTemplate[]
}

export function ExamsList({ templates }: ExamsListProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este examen?")) return

        setIsDeleting(id)
        try {
            const result = await deleteTemplate(id)
            if (result.success) {
                // Examen eliminado correctamente
                router.refresh()
            } else {
                alert("Error al eliminar el examen")
            }
        } catch (error) {
            alert("Error al eliminar el examen")
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/fp-informatica" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Exámenes</h1>
                        <p className="text-sm text-gray-500">Gestión de plantillas y exámenes</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/fp-informatica/exams/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Examen
                    </Link>
                </Button>
            </div>

            {templates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay exámenes creados</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        Comienza creando tu primera plantilla de examen para gestionar tus evaluaciones.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/fp-informatica/exams/create">
                            Crear mi primer examen
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold line-clamp-1" title={template.name}>
                                            {template.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-1">
                                            {template.subject || "Sin asignatura"}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/fp-informatica/exams/create?id=${template.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => handleDelete(template.id)}
                                                disabled={isDeleting === template.id}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="space-y-2 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <FileText className="mr-2 h-4 w-4 text-gray-400" />
                                        <span>{template.course || "General"}</span>
                                    </div>
                                    {template.date && (
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                            <span>{new Date(template.date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                        <span>Actualizado: {new Date(template.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href={`/fp-informatica/exams/create?id=${template.id}`}>
                                        Abrir / Editar
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
