import { prisma } from '@/lib/prisma';
import { CheckCircle2, Circle, Clock, FileText, Send } from 'lucide-react';

export default async function TfmPage() {
    // Ideally we would fetch the specific TFM subject or a TFM model. 
    // For now we mock the phases or use a task list from the "Master UNIE" category filtered by TFM?
    // Let's build a dedicated UI that eventually links to real data.

    const phases = [
        { id: 1, title: 'Elección de Tema y Tutor', status: 'COMPLETED', date: '10 Dic 2025' },
        { id: 2, title: 'Anteproyecto / Propuesta', status: 'IN_PROGRESS', date: 'Due: 15 Ene 2026' },
        { id: 3, title: 'Desarrollo de Memoria', status: 'PENDING', date: 'Due: 15 Abr 2026' },
        { id: 4, title: 'Revisión con Tutor', status: 'PENDING', date: 'Due: 1 May 2026' },
        { id: 5, title: 'Depósito TFM', status: 'PENDING', date: 'Due: 15 Jun 2026' },
        { id: 6, title: 'Defensa ante Tribunal', status: 'PENDING', date: 'Jul 2026' },
    ];

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

            {/* Main Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Phases / Milestones */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border shadow-sm p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Hitos del Proyecto</h2>

                        <div className="relative">
                            {/* Connector Line */}
                            <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-slate-100"></div>

                            <div className="space-y-8 relative">
                                {phases.map((phase) => (
                                    <div key={phase.id} className="flex items-start space-x-4">
                                        <div className="bg-white z-10">
                                            {phase.status === 'COMPLETED' ? (
                                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                                            ) : phase.status === 'IN_PROGRESS' ? (
                                                <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
                                            ) : (
                                                <Circle className="h-8 w-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-center">
                                                <h3 className={`font-semibold text-lg ${phase.status === 'PENDING' ? 'text-slate-400' : 'text-slate-900'}`}>
                                                    {phase.title}
                                                </h3>
                                                <span className="text-sm text-slate-500 font-medium">{phase.date}</span>
                                            </div>
                                            {phase.status === 'IN_PROGRESS' && (
                                                <div className="mt-2 text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                    <p>Objetivo actual: Completar la redacción de la introducción y metodología.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
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
