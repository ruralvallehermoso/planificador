import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';

export default async function SubjectsPage() {
    const subjects = await prisma.subject.findMany({
        orderBy: { semester: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Asignaturas</h2>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Asignatura
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.length === 0 ? (
                    <div className="col-span-2 p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
                        No hay asignaturas.
                    </div>
                ) : (
                    subjects.map(subject => (
                        <div key={subject.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {subject.name}
                                    </h3>
                                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{subject.code || 'N/A'}</span>
                                        <span>•</span>
                                        <span>{subject.credits} ECTS</span>
                                        <span>•</span>
                                        <span>Semecestre {subject.semester}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2">
                                        {subject.professor ? `Prof. ${subject.professor}` : 'Profesor no asignado'}
                                    </p>
                                </div>
                                <div className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 shrink-0">
                                    {subject.status}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-sm text-slate-500">
                                    {subject.finalGrade ? `Nota Final: ${subject.finalGrade}` : 'Sin evaluar'}
                                </span>
                                <Link href={`/master-unie/asignaturas/${subject.id}`} className="text-sm text-blue-600 font-medium hover:underline flex items-center">
                                    Ver detalles <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
