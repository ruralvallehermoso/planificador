'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus, Lock, Unlock, Shield, Building2, TrendingUp,
    Bitcoin, Landmark, MoreHorizontal, Key, Wallet,
    ExternalLink, AlertTriangle, Loader2
} from 'lucide-react';
import { vaultClient, Platform, platformTypeIcons, platformTypeLabels } from '@/lib/vault-client';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    BANK: { icon: Building2, color: '#3b82f6' },
    BROKER: { icon: TrendingUp, color: '#10b981' },
    CRYPTO: { icon: Bitcoin, color: '#f59e0b' },
    FUND: { icon: Landmark, color: '#8b5cf6' },
    OTHER: { icon: MoreHorizontal, color: '#6b7280' },
};

export default function VaultPage() {
    const [connected, setConnected] = useState<boolean | null>(null);
    const [unlocked, setUnlocked] = useState(false);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [masterPassword, setMasterPassword] = useState('');
    const [unlocking, setUnlocking] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    async function checkConnection() {
        setLoading(true);
        try {
            const status = await vaultClient.checkConnection();
            setConnected(status.connected);
            setUnlocked(status.unlocked);

            if (status.connected && status.unlocked) {
                await loadPlatforms();
            }
        } catch {
            setConnected(false);
        } finally {
            setLoading(false);
        }
    }

    async function loadPlatforms() {
        try {
            const data = await vaultClient.getPlatforms();
            setPlatforms(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading platforms');
        }
    }

    async function handleUnlock(e: React.FormEvent) {
        e.preventDefault();
        setUnlocking(true);
        setError(null);

        try {
            const result = await vaultClient.unlock(masterPassword);
            if (result.success) {
                setUnlocked(true);
                setMasterPassword('');
                await loadPlatforms();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error unlocking vault');
        } finally {
            setUnlocking(false);
        }
    }

    async function handleLock() {
        try {
            await vaultClient.lock();
            setUnlocked(false);
            setPlatforms([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error locking vault');
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Not connected state
    if (!connected) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        Vault Seguro
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Almacenamiento cifrado de credenciales
                    </p>
                </div>

                <div className="bg-amber-50 text-amber-800 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold mb-1">Vault no disponible</h3>
                            <p className="text-sm mb-4">
                                El servidor del vault no está ejecutándose. Esta función solo está disponible
                                cuando ejecutas la aplicación localmente.
                            </p>
                            <div className="bg-amber-100 rounded-lg p-4 text-sm font-mono">
                                <p className="text-amber-900 mb-2">Para iniciar el vault:</p>
                                <code className="text-xs">
                                    cd ~/PERSONAL/Proyectos/Finanzas/vault<br />
                                    VAULT_MASTER_KEY=&quot;tu-clave&quot; python main.py
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Locked state
    if (!unlocked) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        Vault Seguro
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Almacenamiento cifrado de credenciales
                    </p>
                </div>

                <div className="max-w-md mx-auto mt-12">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                                <Lock className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Vault Bloqueado</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Introduce tu contraseña maestra para acceder
                            </p>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Contraseña maestra
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={masterPassword}
                                    onChange={(e) => setMasterPassword(e.target.value)}
                                    placeholder="Contraseña maestra"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={unlocking || !masterPassword}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {unlocking ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Unlock className="h-5 w-5" />
                                )}
                                Desbloquear
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Unlocked - show platforms
    const totalValue = platforms.reduce((sum, p) => sum + p.total_value, 0);
    const totalCredentials = platforms.reduce((sum, p) => sum + p.credential_count, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        Vault Seguro
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Almacenamiento cifrado de credenciales
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLock}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Lock className="h-4 w-4" />
                        Bloquear
                    </button>
                    <Link
                        href="/finanzas/vault/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Plataforma
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{platforms.length}</p>
                            <p className="text-xs text-gray-500">Plataformas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Key className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalCredentials}</p>
                            <p className="text-xs text-gray-500">Credenciales</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Wallet className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                            </p>
                            <p className="text-xs text-gray-500">Valor total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform list */}
            {platforms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay plataformas</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Añade tu primera plataforma financiera
                    </p>
                    <Link
                        href="/finanzas/vault/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Plataforma
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {platforms.map((platform) => {
                        const config = TYPE_CONFIG[platform.type] || TYPE_CONFIG.OTHER;
                        const Icon = config.icon;

                        return (
                            <Link
                                key={platform.id}
                                href={`/finanzas/vault/${platform.id}`}
                                className="group bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-indigo-300 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span
                                        className="text-xs font-medium px-2 py-1 rounded-full"
                                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                                    >
                                        {platformTypeLabels[platform.type] || platform.type}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
                                    {platform.name}
                                </h3>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                    <span className="flex items-center gap-1">
                                        <Key className="h-3 w-3" />
                                        {platform.credential_count} accesos
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Wallet className="h-3 w-3" />
                                        {platform.asset_count} activos
                                    </span>
                                </div>

                                {platform.total_value > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <span className="text-lg font-semibold text-gray-900">
                                            {platform.total_value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                                        </span>
                                    </div>
                                )}

                                {platform.website && (
                                    <div className="mt-2">
                                        <span
                                            className="text-xs text-indigo-600 flex items-center gap-1"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {new URL(platform.website.startsWith('http') ? platform.website : `https://${platform.website}`).hostname}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
