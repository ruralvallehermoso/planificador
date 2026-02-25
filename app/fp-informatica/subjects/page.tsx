import { ArrowLeft, Book, Calendar, Clock, FileText, Plus, Trash2, Pencil, Library } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { deleteSubject } from "@/lib/actions/fp-subjects"

export default async function SubjectsListPage() {
    const subjects = await prisma.subject.findMany({
        where: { category: { slug: 'fp-informatica' } },
        orderBy: { name: 'asc' },
        include: { _count: { select: { topics: true, practices: true } } }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/fp-informatica" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Asignaturas</h1>
                        <p className="text-sm text-gray-500">Gestión de planes de estudio</p>
                    </div>
                </div>
                <Link href="/fp-informatica/subjects/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Asignatura
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Library className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No hay asignaturas registradas</h3>
                        <p className="text-gray-500">Crea tu primera asignatura para empezar a organizar el contenido.</p>
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <div key={subject.id} className="relative bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer flex flex-col h-full">
                            <Link href={`/fp-informatica/subjects/${subject.id}`} className="absolute inset-0 z-0" />

                            <div className="flex justify-between items-start relative z-10 mb-6 flex-1">
                                <div className="space-y-2">
                                    <div className="flex flex-col items-start gap-2">
                                        {subject.code && (
                                            <span className="text-xs font-bold font-mono bg-indigo-50 px-2.5 py-1 rounded-full text-indigo-700">
                                                {subject.code}
                                            </span>
                                        )}
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {subject.name}
                                        </h3>
                                    </div>
                                    {subject.description && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{subject.description}</p>}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/fp-informatica/subjects/${subject.id}/edit`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <form action={async () => {
                                        'use server'
                                        await deleteSubject(subject.id)
                                    }}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-full">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            {/* Bento Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2 relative z-10 mt-auto">
                                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-purple-50/50">
                                    <Clock className="w-5 h-5 text-purple-400 mb-2 opacity-50" />
                                    <span className="text-2xl font-bold text-gray-900">{subject.semester}º</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 mt-1">Cuatri</span>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-blue-50/50">
                                    <Book className="w-5 h-5 text-blue-400 mb-2 opacity-50" />
                                    <span className="text-2xl font-bold text-gray-900">{subject._count.topics}</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 mt-1">Temas</span>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-green-50/50">
                                    <FileText className="w-5 h-5 text-green-400 mb-2 opacity-50" />
                                    <span className="text-2xl font-bold text-gray-900">{subject._count.practices}</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 mt-1">Prácticas</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
