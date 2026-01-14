// lib/holidays.ts

// Madrid 2026 School Calendar (Approximated based on typical dates + User request for Madrid)
// Includes National, Regional (Madrid), and some typical "school holidays".

const HOLIDAYS_2026 = [
    '2026-01-01', // Año Nuevo
    '2026-01-06', // Reyes
    '2026-03-19', // San José (Possible optional, often typical in Madrid/Spain)
    '2026-03-30', // Semana Santa (Lunes - start of break?) -> Let's check 2026 Easter.
    '2026-03-31',
    '2026-04-01',
    '2026-04-02', // Jueves Santo
    '2026-04-03', // Viernes Santo
    '2026-05-01', // Fiesta del Trabajo
    '2026-05-02', // Fiesta de la Comunidad de Madrid
    '2026-05-15', // San Isidro (Madrid Local)
    '2026-10-12', // Fiesta Nacional de España
    '2026-11-01', // Todos los Santos
    '2026-11-09', // Almudena (Madrid Local)
    '2026-12-06', // Constitución
    '2026-12-08', // Inmaculada
    '2026-12-25', // Navidad
];

// Calculation of Easter 2026:
// Easter Sunday 2026 is April 5.
// Jueves Santo: April 2. Viernes: April 3.
// School holidays (Semana Santa) usually include the whole week or days before/after.
// I included March 30-April 3 effectively.

export function isHoliday(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return HOLIDAYS_2026.includes(dateString);
}

export function getHolidaysBetween(start: Date, end: Date): string[] {
    const holidays = [];
    const current = new Date(start);
    while (current <= end) {
        if (isHoliday(current)) {
            holidays.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
    }
    return holidays;
}
