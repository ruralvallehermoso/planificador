import { Role } from '@/prisma/generated/prisma'

// Module names as constants
export const MODULES = {
    CASA_RURAL: 'casa-rural',
    FINANZAS: 'finanzas',
    FP_INFORMATICA: 'fp-informatica',
    HOGAR: 'hogar',
    MASTER_UNIE: 'master-unie',
} as const

export type ModuleName = typeof MODULES[keyof typeof MODULES]

// Default permissions by role
export const ROLE_PERMISSIONS: Record<Role, ModuleName[]> = {
    ADMIN: [MODULES.CASA_RURAL, MODULES.FINANZAS, MODULES.FP_INFORMATICA, MODULES.HOGAR, MODULES.MASTER_UNIE],
    OWNER: [MODULES.CASA_RURAL, MODULES.FINANZAS, MODULES.HOGAR],
    TEACHER: [MODULES.FP_INFORMATICA, MODULES.MASTER_UNIE],
    FAMILY: [MODULES.HOGAR],
    CASA_RURAL: [MODULES.CASA_RURAL],
    EMPLEADO: [MODULES.CASA_RURAL], // Limited to SES Hospedajes + Actividades only
    GUEST: [],
}

// Module display info
export const MODULE_INFO: Record<ModuleName, { name: string; description: string; href: string; color: string }> = {
    'casa-rural': {
        name: 'Casa Rural',
        description: 'Gestión de reservas y contabilidad',
        href: '/casa-rural',
        color: 'from-emerald-500 to-teal-600',
    },
    'finanzas': {
        name: 'Finanzas',
        description: 'Simulador financiero y portfolio',
        href: '/finanzas',
        color: 'from-blue-500 to-indigo-600',
    },
    'fp-informatica': {
        name: 'FP Informática',
        description: 'Gestión de proyectos y alumnos',
        href: '/fp-informatica',
        color: 'from-purple-500 to-pink-600',
    },
    'hogar': {
        name: 'Hogar',
        description: 'Calendario y tareas del hogar',
        href: '/hogar',
        color: 'from-orange-500 to-red-600',
    },
    'master-unie': {
        name: 'Máster UNIE',
        description: 'Seguimiento académico',
        href: '/master-unie',
        color: 'from-cyan-500 to-blue-600',
    },
}
