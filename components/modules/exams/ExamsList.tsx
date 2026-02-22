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
    { banner: "bg-gradient-to-r from-blue-600 to-cyan-500", ring: "text-blue-500", evalBg: "bg-blue-50", evalText: "text-blue-700", evalBorder: "border-blue-200" },
    { banner: "bg-gradient-to-r from-emerald-500 to-teal-400", ring: "text-emerald-500", evalBg: "bg-emerald-50", evalText: "text-emerald-700", evalBorder: "border-emerald-200" },
    { banner: "bg-gradient-to-r from-violet-600 to-fuchsia-500", ring: "text-violet-500", evalBg: "bg-violet-50", evalText: "text-violet-700", evalBorder: "border-violet-200" },
    { banner: "bg-gradient-to-r from-orange-500 to-amber-400", ring: "text-orange-500", evalBg: "bg-orange-50", evalText: "text-orange-700", evalBorder: "border-orange-200" },
    { banner: "bg-gradient-to-r from-rose-500 to-pink-500", ring: "text-rose-500", evalBg: "bg-rose-50", evalText: "text-rose-700", evalBorder: "border-rose-200" },
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
    const radius = 24
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
        <div className="flex items-center gap-3">
            <div className="relative w-[54px] h-[54px]">
                <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle
                        cx="30" cy="30" r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${color} transition-all duration-700 ease-out`}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
                    {value}%
                </span>
            </div>
            <span className="text-sm font-medium text-gray-600">{label}</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link href="/fp-informatica" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exámenes</h1>
                        <p className="text-sm text-gray-500">Gestión de plantillas y exámenes</p>
                    </div>
                </div>
                <Button asChild className="gap-2 shadow-sm">
                    <Link href="/fp-informatica/exams/create">
                        <Plus className="h-4 w-4" />
                        Nuevo Examen
                    </Link>
                </Button>
            </div>

            {/* Empty state */}
            {templates.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FileText className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay exámenes creados</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Comienza creando tu primera plantilla de examen estructurada para gestionar y evaluar a tus alumnos eficientemente.
                    </p>
                    <Button asChild size="lg" className="shadow-sm">
                        <Link href="/fp-informatica/exams/create">
                            <Plus className="mr-2 h-5 w-5" />
                            Crear mi primer examen
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => {
                        const colors = getSubjectColor(template.subject)
                        const p1 = parseFloat(template.part1Percentage?.replace('%', '') || '0')
                        const p2 = parseFloat(template.part2Percentage?.replace('%', '') || '0')
                        const hasParts = p1 > 0 || p2 > 0

                        return (
                            <Link
                                key={template.id}
                                href={`/fp-informatica/exams/${template.id}`}
                                className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden relative outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                {/* Top Banner */}
                                <div className={`h-24 w-full ${colors.banner} relative p-5 flex items-start justify-between`}>
                                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-white/20">
                                        <Tag className="h-3.5 w-3.5" />
                                        <span className="text-xs font-semibold tracking-wide">
                                            {template.subject || 'Examen'}
                                        </span>
                                    </div>

                                    {/* Action Menu - Overlayed on Banner */}
                                    <div className="relative z-10" onClick={(e) => e.preventDefault()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full focus-visible:ring-0">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 shadow-lg border-gray-100 rounded-xl">
                                                <DropdownMenuItem asChild className="p-2.5 cursor-pointer">
                                                    <Link href={`/fp-informatica/exams/${template.id}`}>
                                                        <Edit className="mr-2.5 h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">Modificar Examen</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="p-2.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handleDelete(template.id)
                                                    }}
                                                    disabled={isDeleting === template.id}
                                                >
                                                    <Trash2 className="mr-2.5 h-4 w-4" />
                                                    <span className="font-medium">Eliminar</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Main Content Body */}
                                <div className="flex-1 px-6 pt-5 pb-6 flex flex-col">
                                    {/* Title Section */}
                                    <div className="mb-4 flex-1">
                                        <h3 className="text-[1.15rem] font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 mb-2">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 line-clamp-1">
                                            {[template.course, template.cycle].filter(Boolean).join(" • ")}
                                        </p>
                                    </div>

                                    {/* Evaluation Badge if present */}
                                    {template.evaluation && (
                                        <div className="mb-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${colors.evalBg} ${colors.evalText} ${colors.evalBorder}`}>
                                                {template.evaluation}
                                            </span>
                                        </div>
                                    )}

                                    {/* Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[13px] text-gray-600 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        {template.date && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="truncate" title={new Date(template.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Madrid" })}>
                                                    {new Date(template.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Madrid" })}
                                                </span>
                                            </div>
                                        )}
                                        {template.duration && (
                                            <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="truncate">{template.duration}</span>
                                            </div>
                                        )}
                                        {template.raEvaluated && (
                                            <div className="flex items-center gap-2 col-span-2 pt-2 border-t border-gray-200/60 mt-1">
                                                <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="truncate text-gray-500 italic">RA: {template.raEvaluated}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Donut Charts / Footer */}
                                    {hasParts && (
                                        <div className="mt-auto border-t border-gray-100 pt-5 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                {p1 > 0 && <DonutChart value={p1} color={colors.ring} label="Parte 1" />}
                                                {p2 > 0 && <DonutChart value={p2} color="text-indigo-500" label="Parte 2" />}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Timestamp */}
                                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100">
                                    <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Clock className="h-3.5 w-3.5" />
                                        Actualizado {formatTimeAgo(template.updatedAt)}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
