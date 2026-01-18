import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, GraduationCap, CheckCircle, Clock, ChevronRight } from 'lucide-react';
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
    const passedSubjects = subjects.filter(s => s.status === 'PASSED').length;
    const enrolledSubjects = subjects.filter(s => s.status === 'ENROLLED' || s.status === 'IN_PROGRESS').length;

    const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
    const completedCredits = subjects
        .filter(s => s.status === 'PASSED')
        .reduce((acc, s) => acc + s.credits, 0);

    const progressPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Asignaturas Activas</p>
                        <h3 className="text-2xl font-bold text-slate-900">{enrolledSubjects}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Créditos Completados</p>
                        <h3 className="text-2xl font-bold text-slate-900">{completedCredits} / {totalCredits}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Progreso</p>
                        <h3 className="text-2xl font-bold text-slate-900">{Math.round(progressPercentage)}%</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Subjects List */}
                <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900">Asignaturas</h3>
                        <Link href="/master-unie/asignaturas" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver todas</Link>
                    </div>
                    <div className="divide-y flex-1">
                        {subjects.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <p>No hay asignaturas registradas.</p>
                                <p className="text-xs mt-2">Usa el script de seed para cargar datos de ejemplo.</p>
                            </div>
                        ) : (
                            subjects.filter(s => s.status !== 'PASSED').slice(0, 5).map(subject => (
                                <Link key={subject.id} href={`/master-unie/asignaturas/${subject.id}`} className="block p-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {subject.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {subject.professor || 'Sin profesor'} • {subject.credits} ECTS • Semestre {subject.semester}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {subject.status}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                        {subjects.length > 0 && subjects.filter(s => s.status !== 'PASSED').length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                <p>¡Todo completado! No tienes asignaturas activas.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Deadlines / Sidebar */}
                <div className="space-y-6">
                    <MasterTaskList tasks={tasks} />
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Próximas Entregas</h3>
                        </div>
                        <div className="p-6 text-center text-slate-500">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            <p>No hay entregas pendientes.</p>
                            <Link href="/master-unie/evaluaciones" className="text-xs text-blue-600 mt-2 block hover:underline">Gestionar evaluacines</Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">TFM</h3>
                        <p className="text-indigo-100 text-sm mb-4">Trabajo Fin de Máster</p>
                        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                            <div className="bg-white rounded-full h-2 w-[10%]"></div>
                        </div>
                        <p className="text-xs text-indigo-100 mb-4">Fase: Selección de tema</p>
                        <Link href="/master-unie/tfm" className="block w-full text-center py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                            Ir al TFM
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
