import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Award, Calculator, TrendingUp, Calendar } from 'lucide-react';

export default async function EvaluationsPage() {
    const subjects = await prisma.subject.findMany({
        orderBy: { semester: 'asc' },
        include: {
            assessments: true
        }
    });

    // Calculations
    const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);

    // GPA ( Weighted average by credits )
    // Only count subjects with a finalGrade
    const gradedSubjects = subjects.filter(s => s.finalGrade !== null);
    const gradedCredits = gradedSubjects.reduce((acc, s) => acc + s.credits, 0);
    const weightedGradeSum = gradedSubjects.reduce((acc, s) => acc + (s.finalGrade! * s.credits), 0);
    const gpa = gradedCredits > 0 ? (weightedGradeSum / gradedCredits) : 0;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Evaluaciones y Calificaciones</h1>

            {/* GPA Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h2 className="text-xl font-medium text-blue-100 mb-1">Nota Media Global (Ponderada)</h2>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-5xl font-bold">{gpa.toFixed(2)}</span>
                            <span className="text-blue-200">/ 10</span>
                        </div>
                        <p className="mt-4 text-sm text-blue-200 flex items-center">
                            <Award className="h-4 w-4 mr-2" />
                            Basado en {gradedSubjects.length} asignaturas evaluadas ({gradedCredits} créditos)
                        </p>
                    </div>
                    {/* Future: Chart or graphic here */}
                    <div className="mt-6 md:mt-0 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div className="text-center">
                            <p className="text-sm text-blue-100">Créditos Totales</p>
                            <p className="text-2xl font-bold">{totalCredits}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Semester Breakdown */}
            <div className="space-y-6">
                {[1, 2].map(semester => {
                    const semesterSubjects = subjects.filter(s => s.semester === semester);
                    if (semesterSubjects.length === 0) return null;

                    return (
                        <div key={semester} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-slate-900">Semestre {semester}</h3>
                                <span className="text-sm text-slate-500">{semesterSubjects.reduce((acc, s) => acc + s.credits, 0)} ECTS</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluación Continua</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nota Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {semesterSubjects.map((subject) => {
                                            // Calculate continuous assessment current total
                                            const continuousTotal = subject.assessments.reduce((acc, a) => acc + (a.grade || 0) * (a.weight / 100), 0);
                                            const assessedWeight = subject.assessments.reduce((acc, a) => acc + a.weight, 0);

                                            return (
                                                <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link href={`/master-unie/asignaturas/${subject.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                                                            {subject.name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {subject.credits}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(continuousTotal * 10, 100)}%` }}></div>
                                                            </div>
                                                            <span>{continuousTotal.toFixed(2)}</span>
                                                            <span className="text-xs text-gray-400 ml-1">({assessedWeight}%)</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                                        {subject.finalGrade ?? '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
