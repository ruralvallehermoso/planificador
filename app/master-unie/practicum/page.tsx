import { getInternship } from './actions';
import { InternshipLogForm } from '@/components/master/InternshipLogForm';
import { InternshipConfigForm } from '@/components/master/InternshipConfigForm';
import { LogEntryActions } from '@/components/master/LogEntryActions';
import { InternshipPlanningCard } from '@/components/master/InternshipPlanningCard';
import { HolidayCalendar } from '@/components/master/HolidayCalendar';
import { Building2, MapPin, CalendarDays, Download, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function PracticumPage() {
    const internship = await getInternship();

    // Calculate progress
    const totalHours = internship?.totalHours || 120;
    const completedHours = internship?.logs.reduce((acc, log) => acc + log.hours, 0) || 0;
    const progressPercent = Math.min(Math.round((completedHours / totalHours) * 100), 100);
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Prácticum Externo</h1>
                    <p className="text-slate-500 mt-1">Diario de estancias y control de horas</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg font-medium text-sm border ${internship?.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                        internship?.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                        Estado: {internship?.status || 'No Iniciado'}
                    </div>
                    {/* Config Button - Moved here */}
                    <InternshipConfigForm initialData={internship} />

                    {/* Export Button */}
                    <Link href="/master-unie/practicum/export" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Link>
                </div>
            </div>

            {/* School Info */}
            <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-stretch justify-between gap-6 relative group">
                {/* Config Button moved to header */}

                <div className="flex-1 flex items-start space-x-4">
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <Building2 className="h-8 w-8 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{internship?.center?.name || 'Centro no asignado'}</h2>
                        {internship?.center && (
                            <>
                                <div className="flex items-center text-sm text-slate-500 mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {[internship.center.address, internship.center.city].filter(Boolean).join(', ')}
                                </div>
                                <div className="flex flex-col gap-1 mt-2 text-sm text-slate-600">
                                    <div><span className="font-semibold">Tutor Centro:</span> {internship.center.tutorName || '-'}</div>
                                    <div><span className="font-semibold">Tutor Universidad:</span> {internship.center.universityTutor || '-'}</div>
                                </div>
                                {internship.startDate && internship.endDate && (
                                    <div className="mt-2 text-xs text-slate-400">
                                        Periodo: {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                                    </div>
                                )}
                            </>
                        )}
                        {!internship?.center && (
                            <p className="text-sm text-slate-500 mt-2 italic">Configura los datos del centro para comenzar.</p>
                        )}
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-slate-100 mx-2"></div>

                <div className="flex items-center space-x-6 min-w-[200px] justify-center md:justify-end">
                    <div className="text-center">
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Horas Realizadas</p>
                        <p className="text-3xl font-bold text-slate-900">{completedHours} <span className="text-lg text-slate-400 font-normal">/ {totalHours}</span></p>
                    </div>
                    <div className="w-24 h-24 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="40%" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                            <circle
                                cx="50%" cy="50%" r="40%"
                                stroke={progressPercent >= 100 ? "#22c55e" : "#3b82f6"}
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="absolute font-bold text-slate-700">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Planning Card */}
            <InternshipPlanningCard internship={internship} />

            {/* Holiday Calendar */}
            <HolidayCalendar
                startDate={internship?.realStartDate || internship?.startDate}
                endDate={internship?.endDate}
                workingDays={internship?.workingDays || "1,2,3,4,5"}
            />

            {/* Daily Log */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg text-slate-900">Diario de Prácticas</h3>
                        <InternshipLogForm />
                    </div>
                    {/* Optional: Filter or Sort controls could go here */}
                </div>

                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-2 border w-24 text-center">Horas</th>
                            <th className="px-4 py-2 border">Actividad Realizada</th>
                            <th className="px-4 py-2 border">Observaciones</th>
                            <th className="px-4 py-2 border w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {internship?.logs && internship.logs.length > 0 ? (
                            internship.logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 border whitespace-nowrap text-sm text-slate-600">
                                        {new Date(log.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 border text-center font-medium text-slate-900">
                                        {log.hours}
                                    </td>
                                    <td className="px-4 py-3 border text-sm text-slate-700">
                                        {log.activity}
                                    </td>
                                    <td className="px-4 py-3 border text-sm italic text-slate-500">
                                        {log.observations}
                                    </td>
                                    <td className="px-2 py-2 border text-center">
                                        <LogEntryActions log={log} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No hay registros todavía. ¡Añade tu primera jornada!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
