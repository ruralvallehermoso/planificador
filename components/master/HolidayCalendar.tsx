'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, Info } from 'lucide-react';
import { HOLIDAYS_2026, Holiday, getHolidaysBetween, countWorkingDays } from '@/lib/holidays';

interface HolidayCalendarProps {
    startDate?: Date | null;
    endDate?: Date | null;
    workingDays: string;
}

export function HolidayCalendar({ startDate, endDate, workingDays }: HolidayCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear] = useState(2026);

    const workingDaysConfig = (workingDays || "1,2,3,4,5").split(',').map(Number);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust for Monday start (0 = Monday in our grid)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Build calendar grid
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    // Get holidays affecting this period
    const periodStart = startDate || new Date(2026, 0, 1);
    const periodEnd = endDate || new Date(2026, 11, 31);
    const holidaysInPeriod = getHolidaysBetween(periodStart, periodEnd);
    const holidaysAffectingWorkDays = holidaysInPeriod.filter(h => {
        const date = new Date(h.date);
        return workingDaysConfig.includes(date.getDay());
    });

    // Calculate impact
    const totalWorkingDays = countWorkingDays(periodStart, periodEnd, workingDaysConfig);
    const daysWithoutHolidays = totalWorkingDays; // Already excludes holidays

    // Helper to check if date is a holiday
    const getHolidayForDay = (day: number): Holiday | undefined => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return HOLIDAYS_2026.find(h => h.date === dateStr);
    };

    // Check if date is in practicum period
    const isInPeriod = (day: number): boolean => {
        const date = new Date(currentYear, currentMonth, day);
        return date >= periodStart && date <= periodEnd;
    };

    // Check if it's a working day
    const isWorkingDay = (day: number): boolean => {
        const date = new Date(currentYear, currentMonth, day);
        return workingDaysConfig.includes(date.getDay());
    };

    const typeColors = {
        national: 'bg-red-100 text-red-700 border-red-200',
        regional: 'bg-orange-100 text-orange-700 border-orange-200',
        local: 'bg-amber-100 text-amber-700 border-amber-200',
        school: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-lg text-slate-900">Calendario Escolar Madrid 2026</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentMonth(m => m > 0 ? m - 1 : 11)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <span className="font-medium text-slate-900 w-24 text-center">
                        {monthNames[currentMonth]}
                    </span>
                    <button
                        onClick={() => setCurrentMonth(m => m < 11 ? m + 1 : 0)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((day, i) => (
                        <div key={i} className={`text-center text-xs font-medium py-1 ${i >= 5 ? 'text-slate-400' : 'text-slate-600'}`}>
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                        if (day === null) {
                            return <div key={i} className="h-10" />;
                        }
                        const holiday = getHolidayForDay(day);
                        const inPeriod = isInPeriod(day);
                        const working = isWorkingDay(day);
                        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                        return (
                            <div
                                key={i}
                                className={`h-10 flex items-center justify-center text-sm rounded-lg relative group cursor-default transition-all
                                    ${holiday ? typeColors[holiday.type] + ' font-medium border' : ''}
                                    ${!holiday && inPeriod && working ? 'bg-green-50 text-green-700' : ''}
                                    ${!holiday && isWeekend ? 'text-slate-400' : ''}
                                    ${!holiday && !inPeriod && !isWeekend ? 'text-slate-600' : ''}
                                    ${inPeriod ? 'ring-1 ring-indigo-200' : ''}
                                `}
                            >
                                {day}
                                {holiday && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                        {holiday.name}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs mb-6 pb-4 border-b">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
                    <span className="text-slate-600">Nacional</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded" />
                    <span className="text-slate-600">Comunidad</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded" />
                    <span className="text-slate-600">Local Madrid</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded" />
                    <span className="text-slate-600">Escolar</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-green-50 ring-1 ring-indigo-200 rounded" />
                    <span className="text-slate-600">Día laborable en periodo</span>
                </div>
            </div>

            {/* Impact Summary */}
            <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Impacto en tu Prácticum
                </h4>

                {holidaysAffectingWorkDays.length > 0 ? (
                    <div className="space-y-2">
                        <p className="text-sm text-slate-600">
                            <strong>{holidaysAffectingWorkDays.length} festivos</strong> caen en tus días laborables durante el periodo de prácticas:
                        </p>
                        <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                            {holidaysAffectingWorkDays.map((h, i) => (
                                <li key={i} className="flex items-center justify-between py-1 px-2 bg-slate-50 rounded">
                                    <span className="text-slate-700">{h.name}</span>
                                    <span className="text-slate-500 text-xs">
                                        {new Date(h.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Estos días ya están descontados en el cálculo de tu fecha fin estimada.
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-green-600">
                        No hay festivos que afecten a tus días laborables en el periodo seleccionado.
                    </p>
                )}
            </div>
        </div>
    );
}
