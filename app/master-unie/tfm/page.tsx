import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { TFMList } from '@/components/modules/master/TFMList';
import { FileText } from 'lucide-react';

export default async function TfmPage() {
    const session = await auth()

    // Fetch real items from database
    const items = session?.user?.id
        ? await prisma.tFMItem.findMany({
            where: { userId: session.user.id },
            orderBy: { order: 'asc' }
        })
        : []

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Trabajo Fin de Máster</h1>
                    <p className="text-slate-500 mt-1">Gestión y seguimiento del proyecto final</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm border border-indigo-100">
                    Convocatoria: Julio 2026
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-2">
                    <TFMList initialItems={items} />
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    {/* Project Details */}
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Detalles del Proyecto</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Título Provisional</label>
                                <p className="text-sm font-medium text-slate-900 mt-1">
                                    "Impacto de la Gamificación en el Aprendizaje de Matemáticas en Secundaria"
                                </p>
                            </div>
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Tutor/a</label>
                                <div className="flex items-center mt-1">
                                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-2">
                                        JD
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">Dr. Juan Docente</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Linea de Investigación</label>
                                <p className="text-sm font-medium text-slate-900 mt-1">Innovación Educativa</p>
                            </div>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Recursos</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center text-sm text-blue-600 hover:underline cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                Guía Docente TFM 2025
                            </li>
                            <li className="flex items-center text-sm text-blue-600 hover:underline cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                Plantilla Memoria v2.docx
                            </li>
                            <li className="flex items-center text-sm text-blue-600 hover:underline cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                Rubrica de Evaluación
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
