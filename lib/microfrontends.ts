/**
 * Microfrontend Configuration
 * 
 * Define the URLs and settings for each microfrontend application.
 * Update these values based on your local development setup.
 */

export interface MicrofrontendConfig {
    id: string;
    name: string;
    description: string;
    url: string;
    icon?: string;
    color?: string;
}

export const microfrontends: Record<string, MicrofrontendConfig> = {
    'portfolio-master': {
        id: 'portfolio-master',
        name: 'Portfolio Master',
        description: 'Dashboard de inversiones y cartera financiera',
        url: process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'http://localhost:5173',
        icon: 'TrendingUp',
        color: '#10B981',
    },
    'dashboard-financiero': {
        id: 'dashboard-financiero',
        name: 'Simulador Financiero',
        description: 'Simulador financiero y análisis de hipoteca',
        url: (process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:8501') + '/?embed=true',
        icon: 'BarChart3',
        color: '#6366F1',
    },
    'casa-rural': {
        id: 'casa-rural',
        name: 'Casa Rural Contabilidad',
        description: 'Gestión contable de la casa rural',
        url: process.env.NEXT_PUBLIC_CASARURAL_URL || 'http://localhost:3002',
        icon: 'Home',
        color: '#F59E0B',
    },
    'hogar': {
        id: 'hogar',
        name: 'Hogar',
        description: 'Organización familiar y tareas',
        url: process.env.NEXT_PUBLIC_HOGAR_URL || 'http://localhost:3003',
        icon: 'LayoutGrid',
        color: '#8B5CF6',
    },
};

export function getMicrofrontend(id: string): MicrofrontendConfig | undefined {
    return microfrontends[id];
}

export function getAllMicrofrontends(): MicrofrontendConfig[] {
    return Object.values(microfrontends);
}
