export const madridHolidays2025 = [
    "2025-01-01", // Año Nuevo
    "2025-01-06", // Reyes
    "2025-04-17", // Jueves Santo
    "2025-04-18", // Viernes Santo
    "2025-05-01", // Día del Trabajo
    "2025-05-02", // Com. Madrid
    "2025-10-12", // Hispanidad
    "2025-11-01", // Todos los Santos
    "2025-12-06", // Constitución
    "2025-12-08", // Inmaculada
    "2025-12-25", // Navidad
    // School specific holidays (approximate)
    "2025-02-28", // "Semana Blanca" or similar
    "2025-03-03",
]

export function isHoliday(dateStr: string): boolean {
    return madridHolidays2025.includes(dateStr)
}

export function isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6
}
