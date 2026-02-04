'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { vaultClient } from '@/lib/vault-client';

export default function NewCredentialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        label: 'Principal',
        username: '',
        password: '',
        pin: '',
        extra: '',
        notes: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await vaultClient.createCredential(id, formData);
            router.push(`/finanzas/vault/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear la credencial');
            setSaving(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/finanzas/vault/${id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-600" />
                        Nueva Credencial
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                        Etiqueta
                    </label>
                    <input
                        id="label"
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="Principal, API Key, Trading..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Usuario / Email
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="usuario@email.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                        PIN (opcional)
                    </label>
                    <input
                        id="pin"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                        placeholder="••••"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="extra" className="block text-sm font-medium text-gray-700 mb-1">
                        Extra (2FA, API Key...)
                    </label>
                    <input
                        id="extra"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.extra}
                        onChange={(e) => setFormData({ ...formData, extra: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Notas
                    </label>
                    <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link href={`/finanzas/vault/${id}`} className="px-4 py-2 text-sm text-gray-600">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
}
