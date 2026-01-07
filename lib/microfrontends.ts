/**
 * Microfrontend Configuration
 * 
 * Define the URLs and settings for each microfrontend application.
 * In development, uses localhost fallbacks. In production, requires env vars.
 */

// Helper to get URL with intelligent fallbacks
const getUrl = (envVar: string | undefined, devFallback: string): string => {
    if (envVar) return envVar;
    // Solo usar fallback de localhost en desarrollo
    if (process.env.NODE_ENV !== 'production') {
        return devFallback;
    }
    // En producción sin configurar, devolver vacío para mostrar mensaje de no disponible
    return '';
};

export interface MicrofrontendConfig {
    id: string;
    name: string;
    description: string;
    url: string;
    icon?: string;
    color?: string;
    available: boolean;
}

export const microfrontends: Record<string, MicrofrontendConfig> = {
    'portfolio-master': {
        id: 'portfolio-master',
        name: 'Portfolio Master',
        description: 'Dashboard de inversiones y cartera financiera',
        url: getUrl(process.env.NEXT_PUBLIC_PORTFOLIO_URL, 'http://localhost:5173'),
        icon: 'TrendingUp',
        color: '#10B981',
        get available() { return this.url !== ''; },
    },
    'dashboard-financiero': {
        id: 'dashboard-financiero',
        name: 'Simulador Financiero',
        description: 'Simulador financiero y análisis de hipoteca',
        url: getUrl(process.env.NEXT_PUBLIC_DASHBOARD_URL, 'http://localhost:8501') + (getUrl(process.env.NEXT_PUBLIC_DASHBOARD_URL, 'http://localhost:8501') ? '/?embed=true' : ''),
        icon: 'BarChart3',
        color: '#6366F1',
        get available() { return this.url !== ''; },
    },
    'casa-rural': {
        id: 'casa-rural',
        name: 'Casa Rural Contabilidad',
        description: 'Gestión contable de la casa rural',
        url: getUrl(process.env.NEXT_PUBLIC_CASARURAL_URL, 'http://localhost:3002'),
        icon: 'Home',
        color: '#F59E0B',
        get available() { return this.url !== ''; },
    },
    'hogar': {
        id: 'hogar',
        name: 'Hogar',
        description: 'Organización familiar y tareas',
        url: getUrl(process.env.NEXT_PUBLIC_HOGAR_URL, 'http://localhost:3003'),
        icon: 'LayoutGrid',
        color: '#8B5CF6',
        get available() { return this.url !== ''; },
    },
};

export function getMicrofrontend(id: string): MicrofrontendConfig | undefined {
    return microfrontends[id];
}

export function getAllMicrofrontends(): MicrofrontendConfig[] {
    return Object.values(microfrontends);
}

