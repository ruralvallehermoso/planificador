import { ArrowLeft, BookOpen, Calendar, Clock, FileText, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ClassForm } from "@/components/modules/fp/ClassForm"
import { Button } from "@/components/ui/button"
import { deleteClass } from "@/lib/actions/classes"

export default async function ClassesPage() {
    const categorySlug = 'fp-informatica'
    const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
    })

    if (!category) {
        return <div>Categoría no encontrada.</div>
    }

    const classes = await prisma.classSession.findMany({
        where: { categoryId: category.id },
        orderBy: { date: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/fp-informatica" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Clases</h1>
                        <p className="text-sm text-gray-500">Gestión de sesiones y materiales</p>
                    </div>
                </div>
                <ClassForm categoryId={category.id} />
            </div>

            <div className="grid gap-4">
                {classes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No hay clases registradas</h3>
                        <p className="text-gray-500">Añade tu primera clase para empezar a organizar el contenido.</p>
                    </div>
                ) : (
                    classes.map((session) => (
                        <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                                    {session.description && <p className="text-gray-600">{session.description}</p>}
                                </div>
                                <form action={async () => {
                                    'use server'
                                    await deleteClass(session.id)
                                }}>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(session.date).toLocaleDateString()}</span>
                                </div>
                                {(session.startTime || session.endTime) && (
                                    <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {session.startTime || '??'} - {session.endTime || '??'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {(session.content || session.driveLink) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    {session.content && (
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                            {session.content}
                                        </div>
                                    )}
                                    {session.driveLink && (
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={session.driveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Ver materiales en Drive
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
