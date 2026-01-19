'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calculator, CalendarClock, Target, AlertTriangle, CheckCircle2, CalendarCheck } from 'lucide-react';
import { isHoliday } from '@/lib/holidays';

interface InternshipPlanningCardProps {
    internship: {
        totalHours: number;
        hoursPerDay: number;
        startDate?: Date | null;
        endDate?: Date | null;
        realStartDate?: Date | null;
        workingDays: string;
        logs: { hours: number; date: Date }[];
    } | null;
}

export function InternshipPlanningCard({ internship }: InternshipPlanningCardProps) {
    if (!internship) return null;

    // 1. Basic Data
    const targetHours = internship.totalHours || 120;
    const hoursPerDay = internship.hoursPerDay || 5;
    const completedHours = internship.logs.reduce((acc, log) => acc + log.hours, 0);
    const remainingHours = Math.max(0, targetHours - completedHours);

    // 2. Dates
    const startDate = internship.realStartDate ? new Date(internship.realStartDate) : (internship.startDate ? new Date(internship.startDate) : null);
    const normativeEndDate = internship.endDate ? new Date(internship.endDate) : null;

    // 3. Calculate Projected End Date based on hoursPerDay and remaining hours
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Use noon to avoid timezone edge cases

    const workingDaysConfig = (internship.workingDays || "1,2,3,4,5").split(',').map(Number);

    // Calculate how many working days are needed to complete remaining hours
    const workingDaysNeeded = Math.ceil(remainingHours / hoursPerDay);

    // Calculate projected end date by counting working days from today (or start date if in future)
    let projectedEndDate: Date | null = null;
    const countFromDate = startDate && startDate > today ? new Date(startDate) : new Date(today);
    countFromDate.setHours(12, 0, 0, 0);

    if (workingDaysNeeded > 0) {
        let daysCount = 0;
        let currentDate = new Date(countFromDate);

        // Find the Nth working day
        while (true) {
            const dayOfWeek = currentDate.getDay();
            if (workingDaysConfig.includes(dayOfWeek) && !isHoliday(currentDate)) {
                daysCount++;
                if (daysCount === workingDaysNeeded) {
                    // This is day N, stop here
                    projectedEndDate = new Date(currentDate);
                    break;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else {
        projectedEndDate = today; // Already done
    }


    // 4. Calculate days remaining until normative end (for comparison)
    let businessDaysUntilNormativeEnd = 0;
    if (normativeEndDate && normativeEndDate > today) {
        let currentDate = new Date(today);
        while (currentDate <= normativeEndDate) {
            const dayOfWeek = currentDate.getDay();
            if (workingDaysConfig.includes(dayOfWeek) && !isHoliday(currentDate)) {
                businessDaysUntilNormativeEnd++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // 5. Status Messages
    let statusMessage = "";
    let statusColor = "text-slate-600";
    let icon = <Target className="h-5 w-5 text-slate-500" />;

    const isOnTrack = projectedEndDate && normativeEndDate && projectedEndDate <= normativeEndDate;
    const daysAhead = normativeEndDate && projectedEndDate
        ? Math.round((normativeEndDate.getTime() - projectedEndDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    if (remainingHours <= 0) {
        statusMessage = "¡Objetivo cumplido! Has completado las horas requeridas.";
        statusColor = "text-green-600";
        icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (!startDate) {
        statusMessage = "Configura la fecha de inicio para calcular tu planificación.";
        statusColor = "text-amber-600";
        icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else if (isOnTrack) {
        statusMessage = `Vas bien. Terminarás ${daysAhead} días antes del límite a ${hoursPerDay}h/día.`;
        statusColor = "text-green-600";
        icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (normativeEndDate && projectedEndDate && projectedEndDate > normativeEndDate) {
        const daysOver = Math.round((projectedEndDate.getTime() - normativeEndDate.getTime()) / (1000 * 60 * 60 * 24));
        statusMessage = `A ${hoursPerDay}h/día te pasarás ${daysOver} días. Considera aumentar las horas diarias.`;
        statusColor = "text-amber-600";
        icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else {
        statusMessage = `A ${hoursPerDay}h/día terminarás el ${projectedEndDate?.toLocaleDateString('es-ES')}.`;
        statusColor = "text-blue-600";
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Planning Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-lg text-slate-900">Planificación de Horas</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Status Block */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">Horas Pendientes</div>
                        <div className="text-2xl font-bold text-slate-900">{remainingHours.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ {targetHours}</span></div>
                        <div className="mt-2 text-xs text-slate-500">
                            Completadas: {completedHours.toFixed(1)}h
                        </div>
                    </div>

                    {/* Pace Block */}
                    <div className={`rounded-lg p-4 border ${remainingHours <= 0 ? 'bg-green-50 border-green-100' : 'bg-indigo-50 border-indigo-100'}`}>
                        <div className={`text-sm mb-1 ${remainingHours <= 0 ? 'text-green-600' : 'text-indigo-600'}`}>Ritmo Configurado</div>
                        <div className={`text-2xl font-bold ${remainingHours <= 0 ? 'text-green-700' : 'text-indigo-700'}`}>
                            {hoursPerDay} <span className="text-sm font-normal opacity-70">h/día</span>
                        </div>
                        <div className={`mt-2 text-xs ${remainingHours <= 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                            {workingDaysNeeded} días laborables restantes
                        </div>
                    </div>
                </div>

                {/* Recommendation */}
                <div className="pt-2 border-t flex items-start gap-3">
                    <div className="mt-1">{icon}</div>
                    <div>
                        <p className={`text-sm font-medium ${statusColor}`}>
                            {statusMessage}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Cálculo basado en tus días configurados y el calendario escolar.
                        </p>
                    </div>
                </div>
            </div>

            {/* Projected End Date Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarCheck className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Fecha Fin Estimada</h3>
                </div>

                <div className="text-center py-4">
                    {projectedEndDate && remainingHours > 0 ? (
                        <>
                            <div className="text-4xl font-bold">
                                {projectedEndDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </div>
                            <div className="text-lg opacity-80 mt-1">
                                {projectedEndDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric' })}
                            </div>
                        </>
                    ) : remainingHours <= 0 ? (
                        <div className="text-2xl font-bold">¡Completado!</div>
                    ) : (
                        <div className="text-lg opacity-80">Configura los datos para calcular</div>
                    )}
                </div>

                {normativeEndDate && remainingHours > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                        <div className="flex justify-between">
                            <span className="opacity-70">Límite normativo:</span>
                            <span className="font-medium">{normativeEndDate.toLocaleDateString('es-ES')}</span>
                        </div>
                        {projectedEndDate && (
                            <div className="flex justify-between mt-1">
                                <span className="opacity-70">Margen:</span>
                                <span className={`font-medium ${daysAhead >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                                    {daysAhead >= 0 ? `${daysAhead} días de sobra` : `${Math.abs(daysAhead)} días de retraso`}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
