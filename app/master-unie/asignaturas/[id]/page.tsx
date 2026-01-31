import { prisma } from "@/lib/prisma"
import { getSubject } from "@/lib/actions/master-subjects"
import { SubjectNotes } from "@/components/modules/master/SubjectNotes"
import { SubjectTasks } from "@/components/modules/master/SubjectTasks"
import { Button } from "@/components/ui/button"
import { ChevronLeft, GraduationCap, User, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
    params: {
        id: string
    }
}

export default async function SubjectDetailPage({ params }: PageProps) {
    const { id } = await params
    const result = await getSubject(id)

    if (!result.success || !result.subject) {
        notFound()
    }

    const { subject } = result

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/master-unie/asignaturas"
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Volver a Asignaturas
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${subject.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                                subject.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                {subject.status === 'PASSED' ? 'Aprobada' :
                                    subject.status === 'IN_PROGRESS' ? 'En Curso' : 'Matriculada'}
                            </span>
                            <span className="text-sm text-slate-400 font-mono">{subject.code}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">{subject.name}</h1>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Profesor</p>
                        <p className="font-medium text-slate-900">{subject.professor || "No asignado"}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Créditos</p>
                        <p className="font-medium text-slate-900">{subject.credits} ECTS</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Semestre</p>
                        <p className="font-medium text-slate-900">{subject.semester}º Semestre</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Notes Section */}
                    <section className="bg-white rounded-xl border border-slate-200 p-6">
                        <SubjectNotes subjectId={subject.id} initialNotes={subject.notes} />
                    </section>
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    {/* Tasks Section */}
                    <SubjectTasks
                        tasks={subject.tasks}
                        subjectId={subject.id}
                        categoryId={subject.categoryId || ""}
                    />

                    {/* Resources Placeholder */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Recursos
                        </h3>
                        <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            Próximamente: Enlaces y Archivos
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
