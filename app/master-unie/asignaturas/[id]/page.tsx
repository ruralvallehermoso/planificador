import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Calendar, Book, Clock, CheckCircle, FileText, Plus } from 'lucide-react';

// Server Action for adding assessments (inline for now)
import { revalidatePath } from 'next/cache';

async function addAssessment(formData: FormData) {
    'use server';
    const subjectId = formData.get('subjectId') as string;
    const title = formData.get('title') as string;
    const weight = parseFloat(formData.get('weight') as string);

    await prisma.assessment.create({
        data: {
            title,
            weight,
            subjectId,
        }
    });
    revalidatePath(`/master-unie/asignaturas/${subjectId}`);
}

async function updateAssessmentGrade(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const subjectId = formData.get('subjectId') as string;
    const grade = formData.get('grade') ? parseFloat(formData.get('grade') as string) : null;

    await prisma.assessment.update({
        where: { id },
        data: { grade }
    });
    revalidatePath(`/master-unie/asignaturas/${subjectId}`);
}

export default async function SubjectDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params; // Ensure params are awaited in next 16+? No, typical in page props but let's be safe
    // Note: in Next.js 15 params is awaitable but in 14 it's object. 
    // Planificador is 16.0.8, so params is a Promise.
    // However, TypeScript might complain if we don't handle it.
    // Let's assume standard behavior for now.

    const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
            assessments: { orderBy: { createdAt: 'asc' } },
            tasks: { orderBy: { priority: 'desc' } }
        }
    });

    if (!subject) {
        notFound();
    }

    // Calculate Grades
    const totalWeight = subject.assessments.reduce((acc, a) => acc + a.weight, 0);
    const weightedSum = subject.assessments.reduce((acc, a) => acc + (a.grade || 0) * (a.weight / 100), 0);
    // Normalized current grade (only counting graded items?)
    // Or absolute grade (assuming 0 for ungraded)? Let's do absolute for final grade projection.
    const currentGrade = weightedSum;

    // Calculate max potential grade based on remaining weight
    const potentialGrade = currentGrade + ((100 - totalWeight) / 100 * 10);
    // This logic assumes weight is percentage (0-100).

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/master-unie/asignaturas" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{subject.name}</h1>
                    <div className="flex items-center space-x-4 text-slate-500 mt-1 text-sm">
                        <div className="flex items-center">
                            <Book className="h-4 w-4 mr-1.5" />
                            {subject.code || 'Sin código'}
                        </div>
                        <div className="flex items-center">
                            <User className="h-4 w-4 mr-1.5" />
                            {subject.professor || 'Profesor no asignado'}
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            {subject.credits} ECTS
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Grades & Calculator */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Grade Overview Card */}
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-slate-900">Evaluación</h2>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-slate-900">{currentGrade.toFixed(2)}</p>
                                <p className="text-xs text-slate-500">Nota Acumulada</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                            <div
                                className="bg-blue-600 h-4 rounded-l-full transition-all duration-500"
                                style={{ width: `${Math.min(currentGrade * 10, 100)}%` }} // 0-10 scale to 0-100%
                            ></div>
                            {/* Potential ghost bar? */}
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-8">
                            <span>0</span>
                            <span>Peso evaluado: {totalWeight}%</span>
                            <span>10</span>
                        </div>

                        {/* Assessments List */}
                        <div className="space-y-4">
                            {subject.assessments.map((assessment) => (
                                <div key={assessment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="font-medium text-slate-900">{assessment.title}</p>
                                            <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                                {assessment.weight}%
                                            </span>
                                        </div>
                                    </div>
                                    <form action={updateAssessmentGrade} className="flex items-center space-x-2">
                                        <input type="hidden" name="id" value={assessment.id} />
                                        <input type="hidden" name="subjectId" value={subject.id} />
                                        <input
                                            type="number"
                                            name="grade"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            placeholder="-"
                                            defaultValue={assessment.grade ?? ''}
                                            className="w-16 px-2 py-1 text-right text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button type="submit" className="text-xs text-blue-600 hover:text-blue-800 hidden group-focus-within:inline-block">
                                            Guardar
                                        </button>
                                    </form>
                                </div>
                            ))}

                            {/* Add Assessment Form Inline */}
                            <form action={addAssessment} className="mt-4 pt-4 border-t border-dashed">
                                <p className="text-sm font-medium text-slate-700 mb-2">Añadir criterio de evaluación</p>
                                <div className="flex gap-2">
                                    <input type="hidden" name="subjectId" value={subject.id} />
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Ej: Examen Parcial"
                                        required
                                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="relative w-24">
                                        <input
                                            type="number"
                                            name="weight"
                                            placeholder="%"
                                            required
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-6"
                                        />
                                        <span className="absolute right-2 top-2 text-slate-400 text-sm">%</span>
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800"
                                    >
                                        Añadir
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tasks & Info */}
                <div className="space-y-6">

                    {/* Tasks Card */}
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Tareas</h2>
                            <Link href="/master-unie/tareas" className="text-xs text-blue-600 font-medium">Ver todas</Link>
                        </div>

                        <div className="space-y-3">
                            {subject.tasks.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No hay tareas pendientes.</p>
                            ) : (
                                subject.tasks.map(task => (
                                    <div key={task.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 ${task.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}></div>
                                        <div>
                                            <p className={`text-sm font-medium ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                {task.title}
                                            </p>
                                            {task.dueDate && (
                                                <p className="text-xs text-slate-400">
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            <button className="w-full py-2 mt-2 text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all flex justify-center items-center">
                                <Plus className="h-4 w-4 mr-2" />
                                Añadir Tarea
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
