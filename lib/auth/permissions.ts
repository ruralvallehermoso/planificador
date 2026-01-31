import { ROLE_PERMISSIONS, MODULES, ModuleName } from './config'

// Use simple types that work on both client and server
type Role = 'ADMIN' | 'OWNER' | 'TEACHER' | 'FAMILY' | 'CASA_RURAL' | 'EMPLEADO' | 'GUEST' | 'MASTER'

type UserForPermissions = {
    role: Role | string
    canAccessCasaRural?: boolean
    canAccessFinanzas?: boolean
    canAccessFpInformatica?: boolean
    canAccessHogar?: boolean
    canAccessMasterUnie?: boolean
}

/**
 * Check if a user can access a specific module
 */
export function canAccessModule(user: UserForPermissions | null, module: ModuleName): boolean {
    // DEBUG: Log permission check
    console.log('[PERMISSIONS] canAccessModule called:', {
        hasUser: !!user,
        role: user?.role,
        module,
        canAccessCasaRural: user?.canAccessCasaRural,
        canAccessFinanzas: user?.canAccessFinanzas,
    });

    if (!user) {
        console.log('[PERMISSIONS] No user, denying access');
        return false
    }

    // Admin has access to everything
    if (user.role === 'ADMIN') {
        console.log('[PERMISSIONS] User is ADMIN, granting full access');
        return true
    }

    // OWNER role also has access to everything (main user of the app)
    if (user.role === 'OWNER') {
        console.log('[PERMISSIONS] User is OWNER, granting full access');
        return true
    }

    // Check per-module overrides first
    switch (module) {
        case MODULES.CASA_RURAL:
            if (user.canAccessCasaRural) return true
            break
        case MODULES.FINANZAS:
            if (user.canAccessFinanzas) return true
            break
        case MODULES.FP_INFORMATICA:
            if (user.canAccessFpInformatica) return true
            break
        case MODULES.HOGAR:
            if (user.canAccessHogar) return true
            break
        case MODULES.MASTER_UNIE:
            if (user.canAccessMasterUnie) return true
            break
    }

    // Fall back to role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role as Role]
    const hasPermission = rolePermissions ? rolePermissions.includes(module) : false

    console.log('[PERMISSIONS] Final check:', { role: user.role, rolePermissions, hasPermission });

    return hasPermission
}

/**
 * Check if user has one of the specified roles
 */
export function hasRole(user: UserForPermissions | null, roles: Role[]): boolean {
    if (!user) return false
    return roles.includes(user.role as Role)
}

/**
 * Get all modules a user can access
 */
export function getAccessibleModules(user: UserForPermissions | null): ModuleName[] {
    if (!user) return []

    if (user.role === 'ADMIN') {
        return Object.values(MODULES)
    }

    const modules: ModuleName[] = []

    // Check each module
    for (const module of Object.values(MODULES)) {
        if (canAccessModule(user, module)) {
            modules.push(module)
        }
    }

    return modules
}

/**
 * Map route path to module name
 */
export function getModuleFromPath(path: string): ModuleName | null {
    if (path.startsWith('/casa-rural')) return MODULES.CASA_RURAL
    if (path.startsWith('/finanzas')) return MODULES.FINANZAS
    if (path.startsWith('/fp-informatica')) return MODULES.FP_INFORMATICA
    if (path.startsWith('/hogar')) return MODULES.HOGAR
    if (path.startsWith('/master-unie')) return MODULES.MASTER_UNIE
    return null
}
