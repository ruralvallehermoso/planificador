"use client"

import Link from "next/link"
import { ArrowLeft, Plus, FileText, Calendar, Clock, MoreVertical, Trash2, Edit, Timer, Tag } from "lucide-react"
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

const ACCENT_COLORS = [
    { bar: "bg-blue-500", ring: "text-blue-500", evalBg: "bg-blue-50", evalText: "text-blue-700", evalBorder: "border-blue-200" },
    { bar: "bg-emerald-500", ring: "text-emerald-500", evalBg: "bg-emerald-50", evalText: "text-emerald-700", evalBorder: "border-emerald-200" },
    { bar: "bg-violet-500", ring: "text-violet-500", evalBg: "bg-violet-50", evalText: "text-violet-700", evalBorder: "border-violet-200" },
    { bar: "bg-cyan-500", ring: "text-cyan-500", evalBg: "bg-cyan-50", evalText: "text-cyan-700", evalBorder: "border-cyan-200" },
]

function getSubjectColor(subject: string | null | undefined) {
    if (!subject) return ACCENT_COLORS[0]
    let hash = 0
    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash)
    }
    return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length]
}

/** SVG donut chart */
function DonutChart({ value, color, label }: { value: number; color: string; label: string }) {
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-[70px] h-[70px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${color} transition-all duration-700 ease-out`}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                    {value}%
                </span>
            </div>
            <span className="text-[11px] font-medium text-gray-500">{label}</span>
        </div>
    )
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) return `hace ${diffMinutes}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays === 1) return `hace 1 día`
    if (diffDays < 30) return `hace ${diffDays} días`
    return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Madrid" })
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
                <div className="space-y-4">
                    {templates.map((template) => {
                        const colors = getSubjectColor(template.subject)
                        const p1 = parseFloat(template.part1Percentage?.replace('%', '') || '0')
                        const p2 = parseFloat(template.part2Percentage?.replace('%', '') || '0')
                        const hasParts = p1 > 0 || p2 > 0

                        return (
                            <Link
                                key={template.id}
                                href={`/fp-informatica/exams/${template.id}`}
                                className="group block"
                            >
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden flex flex-col">
                                    <div className="flex">
                                        {/* Left accent bar */}
                                        <div className={`w-1.5 shrink-0 ${colors.bar}`} />

                                        {/* Content area */}
                                        <div className="flex-1 min-w-0 p-5 flex flex-col sm:flex-row gap-4">
                                            {/* Left: Title + subject info */}
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                                                            {template.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                            {[
                                                                template.subject && `Asignatura: ${template.subject}`,
                                                                template.course && template.course,
                                                            ].filter(Boolean).join(" | ")}
                                                        </p>
                                                    </div>

                                                    {/* Evaluation badge */}
                                                    {template.evaluation && (
                                                        <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.evalBg} ${colors.evalText} ${colors.evalBorder}`}>
                                                            {template.evaluation}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Center: Metadata */}
                                            <div className="flex sm:flex-col gap-3 sm:gap-1.5 sm:min-w-[150px] sm:border-l sm:border-gray-100 sm:pl-4 text-sm text-gray-500 flex-wrap">
                                                {template.date && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                        <span>{new Date(template.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Madrid" })}</span>
                                                    </div>
                                                )}
                                                {template.duration && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Timer className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                        <span>{template.duration}</span>
                                                    </div>
                                                )}
                                                {template.raEvaluated && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Tag className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                        <span className="line-clamp-1">{template.raEvaluated}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Donut charts */}
                                            {hasParts && (
                                                <div className="flex items-center gap-4 sm:border-l sm:border-gray-100 sm:pl-4 shrink-0">
                                                    {p1 > 0 && <DonutChart value={p1} color={colors.ring} label="Parte 1" />}
                                                    {p2 > 0 && <DonutChart value={p2} color="text-indigo-500" label="Parte 2" />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Menu (top right) */}
                                        <div className="pt-3 pr-3 shrink-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            handleDelete(template.id)
                                                        }}
                                                        disabled={isDeleting === template.id}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Footer: timestamp */}
                                    <div className="px-5 py-2 border-t border-gray-100 flex justify-end">
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Actualizado: {formatTimeAgo(template.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
