'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Edit3, Trash2, Plus, Eye, EyeOff, Copy, Check,
    Building2, TrendingUp, Bitcoin, Landmark, MoreHorizontal,
    Key, Wallet, ExternalLink, Loader2, AlertTriangle
} from 'lucide-react';
import { vaultClient, PlatformDetail, Credential, PlatformAsset, platformTypeLabels } from '@/lib/vault-client';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    BANK: { icon: Building2, color: '#3b82f6' },
    BROKER: { icon: TrendingUp, color: '#10b981' },
    CRYPTO: { icon: Bitcoin, color: '#f59e0b' },
    FUND: { icon: Landmark, color: '#8b5cf6' },
    OTHER: { icon: MoreHorizontal, color: '#6b7280' },
};

export default function PlatformDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [platform, setPlatform] = useState<PlatformDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSecrets, setShowSecrets] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadPlatform();
    }, [id, showSecrets]);

    async function loadPlatform() {
        setLoading(true);
        try {
            const data = await vaultClient.getPlatform(id, showSecrets);
            setPlatform(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading platform');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm('¿Estás seguro de que quieres eliminar esta plataforma? Se eliminarán todas las credenciales y activos asociados.')) {
            return;
        }

        setDeleting(true);
        try {
            await vaultClient.deletePlatform(id);
            router.push('/finanzas/vault');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting platform');
            setDeleting(false);
        }
    }

    async function handleDeleteCredential(credentialId: string) {
        if (!confirm('¿Eliminar esta credencial?')) return;
        try {
            await vaultClient.deleteCredential(credentialId);
            loadPlatform();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting credential');
        }
    }

    async function handleDeleteAsset(assetId: string) {
        if (!confirm('¿Eliminar este activo?')) return;
        try {
            await vaultClient.deleteAsset(assetId);
            loadPlatform();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting asset');
        }
    }

    function copyToClipboard(text: string, fieldId: string) {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !platform) {
        return (
            <div className="space-y-6">
                <Link
                    href="/finanzas/vault"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Vault
                </Link>
                <div className="bg-red-50 text-red-800 rounded-xl p-6 border border-red-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold">Error</h3>
                            <p className="text-sm">{error || 'Plataforma no encontrada'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const config = TYPE_CONFIG[platform.type] || TYPE_CONFIG.OTHER;
    const Icon = config.icon;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/finanzas/vault"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{platform.name}</h1>
                        <p className="text-gray-500 text-sm">
                            {platformTypeLabels[platform.type] || platform.type}
                            {platform.website && (
                                <>
                                    {' · '}
                                    <a
                                        href={platform.website.startsWith('http') ? platform.website : `https://${platform.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        {new URL(platform.website.startsWith('http') ? platform.website : `https://${platform.website}`).hostname}
                                        <ExternalLink className="inline h-3 w-3 ml-1" />
                                    </a>
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/finanzas/vault/${id}/edit`}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Edit3 className="h-4 w-4" />
                        Editar
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Notes */}
            {platform.notes && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                    {platform.notes}
                </div>
            )}

            {/* Credentials Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-gray-900">Credenciales</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showSecrets ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <Link
                            href={`/finanzas/vault/${id}/credential/new`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="h-3 w-3" />
                            Añadir
                        </Link>
                    </div>
                </div>

                {platform.credentials.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Key className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No hay credenciales guardadas</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {platform.credentials.map((cred) => (
                            <div key={cred.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium text-gray-900">{cred.label}</span>
                                    <button
                                        onClick={() => handleDeleteCredential(cred.id)}
                                        className="text-gray-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {cred.username && (
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                            <div>
                                                <span className="text-gray-500 text-xs">Usuario</span>
                                                <p className="font-mono text-gray-900">{cred.username}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(cred.username!, `${cred.id}-username`)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedField === `${cred.id}-username` ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {cred.password && (
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                            <div>
                                                <span className="text-gray-500 text-xs">Contraseña</span>
                                                <p className="font-mono text-gray-900">{cred.password}</p>
                                            </div>
                                            {showSecrets && cred.password !== '••••••••' && (
                                                <button
                                                    onClick={() => copyToClipboard(cred.password!, `${cred.id}-password`)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    {copiedField === `${cred.id}-password` ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {cred.pin && (
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                            <div>
                                                <span className="text-gray-500 text-xs">PIN</span>
                                                <p className="font-mono text-gray-900">{cred.pin}</p>
                                            </div>
                                            {showSecrets && cred.pin !== '••••' && (
                                                <button
                                                    onClick={() => copyToClipboard(cred.pin!, `${cred.id}-pin`)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    {copiedField === `${cred.id}-pin` ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {cred.notes && (
                                    <p className="mt-2 text-xs text-gray-500">{cred.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assets Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-emerald-600" />
                        <h2 className="font-semibold text-gray-900">Activos</h2>
                        {platform.total_value > 0 && (
                            <span className="text-sm text-gray-500">
                                · {platform.total_value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                            </span>
                        )}
                    </div>
                    <Link
                        href={`/finanzas/vault/${id}/asset/new`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                        Añadir
                    </Link>
                </div>

                {platform.assets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No hay activos registrados</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {platform.assets.map((asset) => (
                            <div key={asset.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">{asset.name}</h3>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        {asset.asset_type && <span>{asset.asset_type}</span>}
                                        {asset.account_number && <span>· {asset.account_number}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {asset.current_value && (
                                        <span className="text-lg font-semibold text-gray-900">
                                            {asset.current_value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                            {asset.currency}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleDeleteAsset(asset.id)}
                                        className="text-gray-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
