import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, GraduationCap, Clock, ArrowRight, LayoutDashboard, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { getMasterTasks } from './actions';
import { MasterTaskList } from '@/components/master/MasterTaskList';

export default async function MasterDashboardPage() {
    const categorySlug = 'master-unie';
    const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
    });

    const subjects = category ? await prisma.subject.findMany({
        where: { categoryId: category.id },
        orderBy: { name: 'asc' }
    }) : [];

    const tasks = await getMasterTasks();

    // Stats calculation
    const totalSubjects = subjects.length;
    const enrolledSubjects = subjects.filter(s => s.status === 'ENROLLED' || s.status === 'IN_PROGRESS').length;
    const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
    const completedCredits = subjects
        .filter(s => s.status === 'PASSED')
        .reduce((acc, s) => acc + s.credits, 0);

    const progressPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Master UNIE</h1>
                    <p className="text-slate-300 max-w-xl">
                        Gestión académica, seguimiento de asignaturas y control de tareas para tu máster.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Actual</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900">{enrolledSubjects}</h3>
                        <p className="text-sm text-slate-500">Asignaturas Activas</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Total</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900">{completedCredits} <span className="text-sm font-normal text-slate-400">/ {totalCredits}</span></h3>
                        <p className="text-sm text-slate-500">Créditos ECTS</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900">{Math.round(progressPercentage)}%</h3>
                        <p className="text-sm text-slate-500">Progreso Global</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                        <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 rounded-xl text-white shadow-md relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1">TFM</h3>
                            <Link href="/master-unie/tfm" className="text-indigo-100 text-sm hover:text-white flex items-center gap-1">
                                Ir al Trabajo Fin de Máster <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors" />
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="space-y-12">

                {/* Subjects Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Mis Asignaturas</h2>
                        <Link href="/master-unie/asignaturas" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            Ver todas <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 snap-x no-scrollbar md:gap-4 md:pb-0">
                        {subjects.length === 0 ? (
                            <div className="col-span-full min-w-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">No hay asignaturas registradas</p>
                            </div>
                        ) : (
                            subjects.filter(s => s.status !== 'PASSED').slice(0, 6).map(subject => (
                                <Link
                                    key={subject.id}
                                    href={`/master-unie/asignaturas/${subject.id}`}
                                    className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200
                                             min-w-[85vw] md:min-w-0 flex-shrink-0 snap-center"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`px-2 py-1 rounded text-xs font-semibold
                                            ${subject.status === 'ENROLLED' ? 'bg-blue-50 text-blue-700' :
                                                subject.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {subject.status === 'ENROLLED' ? 'Matriculada' :
                                                subject.status === 'IN_PROGRESS' ? 'En Curso' : subject.status}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2 min-h-[3rem]">
                                        {subject.name}
                                    </h3>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium text-slate-700">{subject.credits} ECTS</span>
                                            <span>•</span>
                                            <span>Semestre {subject.semester}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Tasks Widget - Full Width */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-500" />
                            Próximas Entregas
                        </h3>
                        <Link href="/master-unie/tareas" className="text-xs font-medium text-slate-500 hover:text-indigo-600">
                            Ver todo
                        </Link>
                    </div>
                    <div>
                        {/* Remove fixed height so it expands naturally, or keep max-height? 
                            User said "occupy full width", usually implies importance. 
                            I'll keep a reasonable max-height but make it wider. */}
                        <div className="max-h-[500px] overflow-y-auto">
                            <MasterTaskList tasks={tasks} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
