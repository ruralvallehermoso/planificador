/**
 * Vault API Client
 * Connects to the local vault API running on localhost:5001
 */

const VAULT_API_URL = 'http://localhost:5001';

export interface Platform {
    id: string;
    name: string;
    type: 'BANK' | 'BROKER' | 'CRYPTO' | 'FUND' | 'OTHER';
    website?: string;
    logo_url?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    credential_count: number;
    asset_count: number;
    total_value: number;
}

export interface Credential {
    id: string;
    platform_id: string;
    label: string;
    username?: string;
    password?: string;
    pin?: string;
    extra?: string;
    notes?: string;
    last_updated: string;
    created_at: string;
}

export interface PlatformAsset {
    id: string;
    platform_id: string;
    name: string;
    asset_type?: string;
    current_value?: number;
    currency: string;
    finanzas_asset_id?: string;
    account_number?: string;
    notes?: string;
    last_updated: string;
    created_at: string;
}

export interface PlatformDetail extends Platform {
    credentials: Credential[];
    assets: PlatformAsset[];
}

export interface VaultHealth {
    status: string;
    vault_path: string;
    is_unlocked: boolean;
    is_setup: boolean;
    platform_count: number;
}

class VaultClient {
    private baseUrl: string;

    constructor(baseUrl: string = VAULT_API_URL) {
        this.baseUrl = baseUrl;
    }

    private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Check if vault is available and unlocked
     */
    async checkConnection(): Promise<{ connected: boolean; unlocked: boolean }> {
        try {
            const health = await this.fetch<VaultHealth>('/health');
            return { connected: true, unlocked: health.is_unlocked };
        } catch {
            return { connected: false, unlocked: false };
        }
    }

    /**
     * Get vault health status
     */
    async getHealth(): Promise<VaultHealth> {
        return this.fetch<VaultHealth>('/health');
    }

    /**
     * Unlock the vault with master password
     */
    async unlock(masterPassword: string): Promise<{ success: boolean; message: string }> {
        return this.fetch('/unlock', {
            method: 'POST',
            body: JSON.stringify({ master_password: masterPassword }),
        });
    }

    /**
     * Lock the vault
     */
    async lock(): Promise<{ success: boolean; message: string }> {
        return this.fetch('/lock', { method: 'POST' });
    }

    // ============= Platforms =============

    async getPlatforms(type?: string): Promise<Platform[]> {
        const params = type ? `?type=${type}` : '';
        return this.fetch<Platform[]>(`/platforms${params}`);
    }

    async getPlatform(id: string, showSecrets = false): Promise<PlatformDetail> {
        return this.fetch<PlatformDetail>(`/platforms/${id}?show_secrets=${showSecrets}`);
    }

    async createPlatform(data: Partial<Platform>): Promise<Platform> {
        return this.fetch<Platform>('/platforms', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updatePlatform(id: string, data: Partial<Platform>): Promise<Platform> {
        return this.fetch<Platform>(`/platforms/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deletePlatform(id: string): Promise<void> {
        await this.fetch(`/platforms/${id}`, { method: 'DELETE' });
    }

    // ============= Credentials =============

    async createCredential(platformId: string, data: Partial<Credential>): Promise<Credential> {
        return this.fetch<Credential>(`/platforms/${platformId}/credentials`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCredential(credentialId: string, data: Partial<Credential>): Promise<Credential> {
        return this.fetch<Credential>(`/credentials/${credentialId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteCredential(credentialId: string): Promise<void> {
        await this.fetch(`/credentials/${credentialId}`, { method: 'DELETE' });
    }

    // ============= Assets =============

    async createAsset(platformId: string, data: Partial<PlatformAsset>): Promise<PlatformAsset> {
        return this.fetch<PlatformAsset>(`/platforms/${platformId}/assets`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateAsset(assetId: string, data: Partial<PlatformAsset>): Promise<PlatformAsset> {
        return this.fetch<PlatformAsset>(`/assets/${assetId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteAsset(assetId: string): Promise<void> {
        await this.fetch(`/assets/${assetId}`, { method: 'DELETE' });
    }
}

// Singleton instance
export const vaultClient = new VaultClient();

// Helper for platform type icons
export const platformTypeIcons: Record<string, string> = {
    BANK: '🏦',
    BROKER: '📈',
    CRYPTO: '₿',
    FUND: '💰',
    OTHER: '🔐',
};

// Helper for platform type labels
export const platformTypeLabels: Record<string, string> = {
    BANK: 'Banco',
    BROKER: 'Broker',
    CRYPTO: 'Crypto',
    FUND: 'Fondo',
    OTHER: 'Otro',
};
