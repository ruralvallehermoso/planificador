"use client"

import Link from "next/link"
import { ArrowLeft, Plus, FileText, Calendar, Clock, MoreVertical, Trash2, Edit, Timer, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteTemplate } from "@/lib/actions/exams"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ExamTemplate {
    id: string
    name: string
    subject?: string | null
    course?: string | null
    cycle?: string | null
    evaluation?: string | null
    duration?: string | null
    date?: string | null
    raEvaluated?: string | null
    description?: string | null
    part1Percentage?: string | null
    part2Percentage?: string | null
    createdAt: Date
    updatedAt: Date
}

interface ExamsListProps {
    templates: ExamTemplate[]
}

const BADGE_COLORS = [
    { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-500" },
    { bg: "bg-purple-100", text: "text-purple-700", bar: "bg-purple-500" },
    { bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500" },
    { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-500" },
    { bg: "bg-rose-100", text: "text-rose-700", bar: "bg-rose-500" },
    { bg: "bg-cyan-100", text: "text-cyan-700", bar: "bg-cyan-500" },
]

function getSubjectColor(subject: string | null | undefined) {
    if (!subject) return BADGE_COLORS[0]
    let hash = 0
    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash)
    }
    return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length]
}

function Badge({ label, variant }: { label: string; variant: { bg: string; text: string } }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}>
            {label}
        </span>
    )
}

function ProgressBar({ label, percentage, color }: { label: string; percentage: string; color: string }) {
    const value = parseFloat(percentage) || 0
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="text-gray-700 font-semibold">{percentage}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
        </div>
    )
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
            {/* Header */}
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

            {/* Empty state */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {templates.map((template) => {
                        const subjectColor = getSubjectColor(template.subject)
                        const hasParts = template.part1Percentage || template.part2Percentage

                        return (
                            <div
                                key={template.id}
                                className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden flex flex-col"
                            >
                                {/* Color accent bar */}
                                <div className={`h-1 w-full ${subjectColor.bar}`} />

                                {/* Card Header: Name + Menu */}
                                <div className="px-5 pt-4 pb-3 flex justify-between items-start gap-2">
                                    <Link
                                        href={`/fp-informatica/exams/${template.id}`}
                                        className="flex-1 min-w-0"
                                    >
                                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                                            {template.name}
                                        </h3>
                                    </Link>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/fp-informatica/exams/${template.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Abrir / Editar
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

                                {/* Badges */}
                                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                                    {template.subject && (
                                        <Badge label={template.subject} variant={subjectColor} />
                                    )}
                                    {template.course && (
                                        <Badge label={template.course} variant={{ bg: "bg-gray-100", text: "text-gray-700" }} />
                                    )}
                                    {template.evaluation && (
                                        <Badge label={template.evaluation} variant={{ bg: "bg-indigo-50", text: "text-indigo-600" }} />
                                    )}
                                </div>

                                {/* Metadata rows */}
                                <div className="px-5 pb-3 space-y-1.5 flex-1">
                                    {template.date && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="mr-2 h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span>{template.date}</span>
                                        </div>
                                    )}
                                    {template.duration && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Timer className="mr-2 h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span>{template.duration}</span>
                                        </div>
                                    )}
                                    {template.raEvaluated && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <BookOpen className="mr-2 h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span className="line-clamp-1">{template.raEvaluated}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Part percentages */}
                                {hasParts && (
                                    <div className="px-5 pb-3 space-y-2 border-t border-gray-100 pt-3">
                                        {template.part1Percentage && (
                                            <ProgressBar
                                                label="Parte 1"
                                                percentage={template.part1Percentage}
                                                color="bg-blue-500"
                                            />
                                        )}
                                        {template.part2Percentage && (
                                            <ProgressBar
                                                label="Parte 2"
                                                percentage={template.part2Percentage}
                                                color="bg-purple-500"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        {new Date(template.updatedAt).toLocaleString("es-ES", {
                                            timeZone: "Europe/Madrid",
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false
                                        })}
                                    </span>
                                    <Link
                                        href={`/fp-informatica/exams/${template.id}`}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Abrir →
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
