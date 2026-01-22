import { prisma } from "@/lib/prisma"
import { ArrowLeft, BookOpen, Calendar, Clock, ExternalLink, FileText, Pencil, FolderOpen, FileIcon, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
            topics: { orderBy: { order: 'asc' } },
            practices: { orderBy: { order: 'asc' } }
        }
    })

    if (!subject) {
        notFound()
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start justify-between w-full">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Link href="/fp-informatica/subjects" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="h-5 w-5 text-gray-500" />
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
                            {subject.code && (
                                <span className="bg-gray-100 text-gray-700 text-sm font-mono px-2 py-1 rounded-md border border-gray-200">
                                    {subject.code}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 max-w-2xl pl-10">
                            {subject.description || "Sin descripción disponible."}
                        </p>
                    </div>
                </div>
                <Link href={`/fp-informatica/subjects/${subject.id}/edit`}>
                    <Button variant="outline" className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Editar Asignatura
                    </Button>
                </Link>
            </div>

            {/* Info Pills */}
            <div className="flex flex-wrap gap-4 pl-10 border-b pb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>{subject.semester}º Cuatrimestre</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{subject.topics.length} Temas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span>{subject.practices.length} Prácticas</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pl-0 md:pl-2">
                {/* Left Column: Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Temario */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-gray-500" />
                                Temario
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {subject.topics.length === 0 ? (
                                <p className="p-6 text-gray-400 text-center italic">No hay temas registrados.</p>
                            ) : (
                                subject.topics.map((topic, index) => (
                                    <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700 font-medium">{topic.title}</span>
                                        </div>
                                        {topic.materialLink && (
                                            <a
                                                href={topic.materialLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-blue-50 rounded-full"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Materiales
                                            </a>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Prácticas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                Prácticas y Entregas
                            </h2>
                            <Link href={`/fp-informatica/subjects/${subject.id}/practices/create`}>
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8">
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Nueva Práctica
                                </Button>
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {subject.practices.length === 0 ? (
                                <p className="p-6 text-gray-400 text-center italic">No hay prácticas registradas.</p>
                            ) : (
                                subject.practices.map((practice) => (
                                    <div key={practice.id} className="p-4 sm:flex items-start justify-between hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0">
                                        <div className="space-y-1">
                                            <h3 className="text-gray-900 font-medium">{practice.title}</h3>
                                            {practice.deliveryDate && (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-md">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Entrega: {new Date(practice.deliveryDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {practice.statementLink && (
                                                <a
                                                    href={practice.statementLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50"
                                                >
                                                    <FileIcon className="w-3 h-3" />
                                                    Enunciado
                                                </a>
                                            )}
                                            {practice.deliveryFolderLink && (
                                                <a
                                                    href={practice.deliveryFolderLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md shadow-sm"
                                                >
                                                    <FolderOpen className="w-3 h-3" />
                                                    Entrega
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Notes */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-yellow-50/50 rounded-xl border border-yellow-100 p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-yellow-600" />
                            Bloc de Notas
                        </h2>
                        {subject.notes ? (
                            <div
                                className="prose prose-sm prose-yellow max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: subject.notes }}
                            />
                        ) : (
                            <p className="text-sm text-gray-400 italic">No hay notas o apuntes adicionales.</p>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
