'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calculator, CalendarClock, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { isHoliday } from '@/lib/holidays';

interface InternshipPlanningCardProps {
    internship: {
        totalHours: number;
        startDate?: Date | null;
        endDate?: Date | null;
        realStartDate?: Date | null;
        realEndDate?: Date | null;
        workingDays: string;
        logs: { hours: number; date: Date }[];
    } | null;
}

export function InternshipPlanningCard({ internship }: InternshipPlanningCardProps) {
    if (!internship) return null;

    // 1. Basic Data
    const targetHours = internship.totalHours || 200; // Defaulting to 200 as per request if not set
    const completedHours = internship.logs.reduce((acc, log) => acc + log.hours, 0);
    const remainingHours = Math.max(0, targetHours - completedHours);

    // 2. Dates
    // Use real dates if available, otherwise normative
    const startDate = internship.realStartDate ? new Date(internship.realStartDate) : (internship.startDate ? new Date(internship.startDate) : null);
    const endDate = internship.realEndDate ? new Date(internship.realEndDate) : (internship.endDate ? new Date(internship.endDate) : null);

    // 3. Calculate Work Days Remaining
    const today = new Date();
    // Reset time to start of day for accurate calc
    today.setHours(0, 0, 0, 0);

    let businessDaysRemaining = 0;

    // Default to Mon-Fri if not set, though schema default handles this.
    const workingDaysConfig = (internship.workingDays || "1,2,3,4,5").split(',').map(Number);

    if (endDate && endDate > today) {
        let currentDate = new Date(today);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat

            // Check if it's a configured working day AND not a holiday
            if (workingDaysConfig.includes(dayOfWeek) && !isHoliday(currentDate)) {
                businessDaysRemaining++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // 4. Calculate Required Pace
    const dailyHoursNeeded = businessDaysRemaining > 0
        ? parseFloat((remainingHours / businessDaysRemaining).toFixed(2))
        : 0;

    // 5. Status Messages
    let statusMessage = "";
    let statusColor = "text-slate-600";
    let icon = <Target className="h-5 w-5 text-slate-500" />;

    if (remainingHours <= 0) {
        statusMessage = "¡Objetivo cumplido! Has completado las horas requeridas.";
        statusColor = "text-green-600";
        icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (!endDate) {
        statusMessage = "Configura la fecha de fin para calcular tu planificación.";
        statusColor = "text-amber-600";
        icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else if (today > endDate) {
        statusMessage = "La fecha de finalización ha pasado. ¿Necesitas extender el plazo?";
        statusColor = "text-red-600";
        icon = <AlertTriangle className="h-5 w-5 text-red-500" />;
    } else {
        // Advice based on pace
        if (dailyHoursNeeded > 8) {
            statusMessage = `Necesitas un ritmo intensivo de ${dailyHoursNeeded}h/día. Considera ampliar el plazo.`;
            statusColor = "text-red-600";
        } else if (dailyHoursNeeded > 5) {
            statusMessage = `Ritmo exigente: ${dailyHoursNeeded}h/día los días laborables.`;
            statusColor = "text-orange-600";
        } else {
            statusMessage = `Ritmo sostenible: ${dailyHoursNeeded}h/día para terminar a tiempo.`;
            statusColor = "text-blue-600";
        }
    }

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-lg text-slate-900">Planificación de Horas</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Block */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex flex-col justify-between">
                    <div className="text-sm text-slate-500 mb-1">Horas Pendientes</div>
                    <div className="text-2xl font-bold text-slate-900">{remainingHours.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ {targetHours}</span></div>
                    <div className="mt-2 text-xs text-slate-500">
                        Has completado {completedHours.toFixed(1)}h
                    </div>
                </div>

                {/* Time Block */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex flex-col justify-between">
                    <div className="text-sm text-slate-500 mb-1">Tiempo Restante</div>
                    {endDate ? (
                        <>
                            <div className="text-2xl font-bold text-slate-900">{businessDaysRemaining} <span className="text-sm font-normal text-slate-400">días hábiles</span></div>
                            <div className="mt-2 text-xs text-slate-500">
                                Según calendario (festivos Madrid excluidos)
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-amber-600 italic">Fecha fin no definida</div>
                    )}
                </div>

                {/* Pace Block */}
                <div className={`rounded-lg p-4 border flex flex-col justify-between ${remainingHours <= 0 ? 'bg-green-50 border-green-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className={`text-sm mb-1 ${remainingHours <= 0 ? 'text-green-600' : 'text-indigo-600'}`}>Ritmo Necesario</div>
                    <div className={`text-2xl font-bold ${remainingHours <= 0 ? 'text-green-700' : 'text-indigo-700'}`}>
                        {remainingHours <= 0 ? '0' : dailyHoursNeeded} <span className="text-sm font-normal opacity-70">h/día</span>
                    </div>
                    <div className={`mt-2 text-xs ${remainingHours <= 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                        (Días seleccionados)
                    </div>
                </div>
            </div>

            {/* Recommendation / Insight */}
            <div className="pt-2 border-t flex items-start gap-3">
                <div className="mt-1">{icon}</div>
                <div>
                    <p className={`text-sm font-medium ${statusColor}`}>
                        {statusMessage}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Cálculo basado en tus días configurados y el calendario escolar de Madrid 2026.
                    </p>
                </div>
            </div>
        </div>
    );
}
