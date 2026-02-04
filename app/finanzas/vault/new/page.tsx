'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Shield, Building2, TrendingUp, Bitcoin, Landmark,
    MoreHorizontal, Loader2, Globe, FileText
} from 'lucide-react';
import { vaultClient } from '@/lib/vault-client';

const PLATFORM_TYPES = [
    { value: 'BANK', label: 'Banco', icon: Building2, color: '#3b82f6' },
    { value: 'BROKER', label: 'Broker', icon: TrendingUp, color: '#10b981' },
    { value: 'CRYPTO', label: 'Crypto', icon: Bitcoin, color: '#f59e0b' },
    { value: 'FUND', label: 'Fondo', icon: Landmark, color: '#8b5cf6' },
    { value: 'OTHER', label: 'Otro', icon: MoreHorizontal, color: '#6b7280' },
] as const;

type PlatformType = 'BANK' | 'BROKER' | 'CRYPTO' | 'FUND' | 'OTHER';

export default function NewPlatformPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<{
        name: string;
        type: PlatformType;
        website: string;
        notes: string;
    }>({
        name: '',
        type: 'BANK',
        website: '',
        notes: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const platform = await vaultClient.createPlatform(formData);
            router.push(`/finanzas/vault/${platform.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear la plataforma');
            setSaving(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/finanzas/vault"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        Nueva Plataforma
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Añadir una plataforma financiera al vault
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Platform Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de plataforma
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {PLATFORM_TYPES.map(({ value, label, icon: Icon, color }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: value })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.type === value
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor: formData.type === value ? `${color}20` : '#f3f4f6',
                                        color: formData.type === value ? color : '#9ca3af'
                                    }}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className={`text-xs font-medium ${formData.type === value ? 'text-indigo-700' : 'text-gray-500'
                                    }`}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ING Direct, Indexa Capital, Binance..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                    />
                </div>

                {/* Website */}
                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        <Globe className="inline h-4 w-4 mr-1" />
                        Sitio web
                    </label>
                    <input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://ing.es"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Notas
                    </label>
                    <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Información adicional sobre esta plataforma..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Link
                        href="/finanzas/vault"
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Crear Plataforma
                    </button>
                </div>
            </form>
        </div>
    );
}
