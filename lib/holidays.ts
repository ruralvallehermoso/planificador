// lib/holidays.ts

// Madrid 2026 School Calendar (Approximated based on typical dates + User request for Madrid)
// Includes National, Regional (Madrid), and some typical "school holidays".

export interface Holiday {
    date: string;
    name: string;
    type: 'national' | 'regional' | 'local' | 'school';
}

export const HOLIDAYS_2026: Holiday[] = [
    { date: '2026-01-01', name: 'Año Nuevo', type: 'national' },
    { date: '2026-01-06', name: 'Reyes Magos', type: 'national' },
    { date: '2026-03-19', name: 'San José', type: 'regional' },
    { date: '2026-03-27', name: 'No lectivo (compensación)', type: 'school' },
    { date: '2026-03-30', name: 'Semana Santa', type: 'school' },
    { date: '2026-03-31', name: 'Semana Santa', type: 'school' },
    { date: '2026-04-01', name: 'Semana Santa', type: 'school' },
    { date: '2026-04-02', name: 'Jueves Santo', type: 'national' },
    { date: '2026-04-03', name: 'Viernes Santo', type: 'national' },
    { date: '2026-04-06', name: 'No lectivo (compensación)', type: 'school' },
    { date: '2026-05-01', name: 'Día del Trabajo', type: 'national' },
    { date: '2026-05-02', name: 'Comunidad de Madrid', type: 'regional' },
    { date: '2026-05-15', name: 'San Isidro', type: 'local' },
    { date: '2026-10-12', name: 'Fiesta Nacional', type: 'national' },
    { date: '2026-11-01', name: 'Todos los Santos', type: 'national' },
    { date: '2026-11-09', name: 'La Almudena', type: 'local' },
    { date: '2026-12-06', name: 'Constitución', type: 'national' },
    { date: '2026-12-08', name: 'Inmaculada', type: 'national' },
    { date: '2026-12-25', name: 'Navidad', type: 'national' },
];

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
function formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function isHoliday(date: Date): boolean {
    const dateString = formatDateLocal(date);
    return HOLIDAYS_2026.some(h => h.date === dateString);
}

export function getHolidayInfo(date: Date): Holiday | undefined {
    const dateString = formatDateLocal(date);
    return HOLIDAYS_2026.find(h => h.date === dateString);
}

export function getHolidaysBetween(start: Date, end: Date): Holiday[] {
    const holidays: Holiday[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        const holiday = getHolidayInfo(current);
        if (holiday) {
            holidays.push(holiday);
        }
        current.setDate(current.getDate() + 1);
    }
    return holidays;
}

export function countWorkingDays(start: Date, end: Date, workingDaysConfig: number[]): number {
    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (workingDaysConfig.includes(dayOfWeek) && !isHoliday(current)) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}
