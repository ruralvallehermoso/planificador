import { prisma } from '@/lib/prisma';
import { Building2, Clock, MapPin, CalendarDays, PlusCircle } from 'lucide-react';

export default function PracticumPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Prácticum Externo</h1>
                    <p className="text-slate-500 mt-1">Diario de estancias y control de horas</p>
                </div>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium text-sm border border-green-100">
                    Estado: Asignado
                </div>
            </div>

            {/* School Info */}
            <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <Building2 className="h-8 w-8 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">IES Ejemplo de Madrid</h2>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            Calle de la Educación, 123, Madrid
                        </div>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                            <span className="font-semibold mr-1">Tutor Centro:</span> María Profesora
                            <span className="mx-2">•</span>
                            <span className="font-semibold mr-1">Tutor Universidad:</span> Dr. Supervisor
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-center">
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Horas Realizadas</p>
                        <p className="text-3xl font-bold text-slate-900">45 <span className="text-lg text-slate-400 font-normal">/ 120</span></p>
                    </div>
                    <div className="w-24 h-24 relative rounded-full border-4 border-slate-100 flex items-center justify-center">
                        {/* Simplified Circular Progress */}
                        <svg className="w-full h-full absolute inset-0 transform -rotate-90">
                            <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                            <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * 0.375)} className="text-green-500" />
                        </svg>
                        <span className="font-bold text-slate-700">37%</span>
                    </div>
                </div>
            </div>

            {/* Daily Log */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-slate-900">Diario de Prácticas</h3>
                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Registrar Jornada
                    </button>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividades</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { date: '12 Dic 2025', hours: 5, activity: 'Observación de clase 3º ESO - Matemáticas', notes: 'Buen manejo del grupo.' },
                            { date: '11 Dic 2025', hours: 4, activity: 'Reunión departamento y guardia de recreo', notes: '-' },
                            { date: '10 Dic 2025', hours: 5, activity: 'Presentación y conocimiento del centro', notes: 'Firma de documentos.' },
                        ].map((log, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                    <div className="flex items-center">
                                        <CalendarDays className="h-4 w-4 mr-2 text-slate-400" />
                                        {log.date}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {log.hours} h
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {log.activity}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 italic">
                                    {log.notes}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
