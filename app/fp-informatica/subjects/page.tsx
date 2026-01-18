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

            <div className="grid gap-4">
                {subjects.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Library className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No hay asignaturas registradas</h3>
                        <p className="text-gray-500">Crea tu primera asignatura para empezar a organizar el contenido.</p>
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <div key={subject.id} className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:border-blue-300 group cursor-pointer">
                            <Link href={`/fp-informatica/subjects/${subject.id}`} className="absolute inset-0 z-0" />
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {subject.name}
                                        </h3>
                                        {subject.code && (
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                                                {subject.code}
                                            </span>
                                        )}
                                    </div>
                                    {subject.description && <p className="text-gray-600">{subject.description}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/fp-informatica/subjects/${subject.id}/edit`}>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <form action={async () => {
                                        'use server'
                                        await deleteSubject(subject.id)
                                    }}>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md">
                                    <Clock className="h-4 w-4" />
                                    <span>{subject.semester}º Cuatrimestre</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                                    <Book className="h-4 w-4" />
                                    <span>{subject._count.topics} Temas</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                                    <FileText className="h-4 w-4" />
                                    <span>{subject._count.practices} Prácticas</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
