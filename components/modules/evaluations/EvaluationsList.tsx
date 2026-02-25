"use client"

import Link from "next/link"
import { ArrowLeft, Plus, FileSpreadsheet, Clock, MoreVertical, Trash2, Edit, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteFpEvaluation } from "@/lib/actions/fp-evaluations"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FpEvaluation } from "@prisma/client"

interface EvaluationsListProps {
    evaluations: FpEvaluation[]
}

const ACCENT_COLORS = [
    { topBorder: "border-t-indigo-500", tagBg: "bg-indigo-50/80", tagText: "text-indigo-700", evalBg: "bg-indigo-50/50", evalText: "text-indigo-700", evalBorder: "border-indigo-200/60" },
    { topBorder: "border-t-emerald-500", tagBg: "bg-emerald-50/80", tagText: "text-emerald-700", evalBg: "bg-emerald-50/50", evalText: "text-emerald-700", evalBorder: "border-emerald-200/60" },
    { topBorder: "border-t-rose-500", tagBg: "bg-rose-50/80", tagText: "text-rose-700", evalBg: "bg-rose-50/50", evalText: "text-rose-700", evalBorder: "border-rose-200/60" },
    { topBorder: "border-t-blue-500", tagBg: "bg-blue-50/80", tagText: "text-blue-700", evalBg: "bg-blue-50/50", evalText: "text-blue-700", evalBorder: "border-blue-200/60" },
    { topBorder: "border-t-amber-500", tagBg: "bg-amber-50/80", tagText: "text-amber-700", evalBg: "bg-amber-50/50", evalText: "text-amber-700", evalBorder: "border-amber-200/60" },
]

function getSubjectColor(subject: string | null | undefined) {
    if (!subject) return ACCENT_COLORS[0]
    let hash = 0
    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash)
    }
    return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length]
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) return `hace ${diffMinutes || 1}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays === 1) return `hace 1 día`
    if (diffDays < 30) return `hace ${diffDays} días`
    return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Madrid" })
}

export function EvaluationsList({ evaluations }: EvaluationsListProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta evaluación? Perderás todos los datos del Excel importado.")) return
        setIsDeleting(id)
        try {
            const result = await deleteFpEvaluation(id)
            if (result.success) {
                router.refresh()
            } else {
                alert("Error al eliminar la evaluación")
            }
        } catch (error) {
            alert("Error al eliminar la evaluación")
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link href="/fp-informatica" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Evaluación Analítica</h1>
                        <p className="text-sm text-gray-500">Importación de hojas Excel y visualización de notas</p>
                    </div>
                </div>
                <Button asChild className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/fp-informatica/evaluations/create">
                        <Plus className="h-4 w-4" />
                        Nueva Evaluación
                    </Link>
                </Button>
            </div>

            {evaluations.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FileSpreadsheet className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay evaluaciones analíticas</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Crea un contenedor de evaluación para importar tu primer archivo Excel y empezar a visualizar el progreso del alumnado.
                    </p>
                    <Button asChild size="lg" className="shadow-sm bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/fp-informatica/evaluations/create">
                            <Plus className="mr-2 h-5 w-5" />
                            Crear Evaluación Analítica
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {evaluations.map((evalItem) => {
                        const colors = getSubjectColor(evalItem.subject)

                        // Basic heuristic for students count
                        const parsedData = typeof evalItem.studentsData === 'string'
                            ? JSON.parse(evalItem.studentsData || '[]')
                            : evalItem.studentsData as any[]

                        const studentsCount = Array.isArray(parsedData) ? parsedData.length : 0

                        return (
                            <div
                                key={evalItem.id}
                                className={`group flex flex-col bg-white rounded-xl border border-gray-200/75 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden relative border-t-[3px] ${colors.topBorder}`}
                            >
                                {/* Top Header Mini-Banner */}
                                <div className="w-full relative px-6 pt-5 pb-2 flex items-start justify-between">
                                    <div className={`px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${colors.tagBg} ${colors.tagText} border border-transparent shadow-sm`}>
                                        <Tag className="h-3 w-3" />
                                        <span className="text-[11px] font-bold tracking-wide uppercase">
                                            {evalItem.subject || 'Módulo'}
                                        </span>
                                    </div>

                                    {/* Action Menu */}
                                    <div className="relative z-10 -mr-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full focus-visible:ring-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 shadow-lg border-gray-100 rounded-xl">
                                                <DropdownMenuItem asChild className="p-2.5 cursor-pointer">
                                                    <Link href={`/fp-informatica/evaluations/create?id=${evalItem.id}`}>
                                                        <Edit className="mr-2.5 h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">Editar Datos</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="p-2.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handleDelete(evalItem.id)
                                                    }}
                                                    disabled={isDeleting === evalItem.id}
                                                >
                                                    <Trash2 className="mr-2.5 h-4 w-4" />
                                                    <span className="font-medium">Eliminar</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Main Content Body - Clickable */}
                                <Link href={`/fp-informatica/evaluations/${evalItem.id}`} className="flex-1 px-6 pt-5 pb-6 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 inset-0 absolute" aria-label={`Ver evaluación ${evalItem.name}`} />

                                <div className="flex-1 px-6 pt-2 pb-6 flex flex-col pointer-events-none">
                                    <div className="mb-4 flex-1">
                                        <h3 className="text-[1.15rem] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 mb-2">
                                            {evalItem.name || 'Evaluación sin título'}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 line-clamp-1">
                                            {[evalItem.course, evalItem.cycle].filter(Boolean).join(" • ")}
                                        </p>
                                    </div>

                                    {evalItem.evaluation && (
                                        <div className="mb-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${colors.evalBg} ${colors.evalText} ${colors.evalBorder}`}>
                                                {evalItem.evaluation}
                                            </span>
                                        </div>
                                    )}

                                    {/* Data Presence Indicator */}
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 mt-auto">
                                        <div className={`p-2 rounded-lg ${studentsCount > 0 ? 'bg-indigo-100' : 'bg-gray-200'}`}>
                                            <FileSpreadsheet className={`h-4 w-4 ${studentsCount > 0 ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-500">Estado de Datos</span>
                                            <span className={`text-sm font-bold ${studentsCount > 0 ? 'text-indigo-700' : 'text-gray-600'}`}>
                                                {studentsCount > 0 ? `${studentsCount} alumnos` : 'Sin Excel'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Timestamp */}
                                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100">
                                    <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Clock className="h-3.5 w-3.5" />
                                        Actualizado {formatTimeAgo(evalItem.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
