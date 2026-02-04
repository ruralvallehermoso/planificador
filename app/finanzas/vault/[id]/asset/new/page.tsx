'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wallet, Loader2 } from 'lucide-react';
import { vaultClient } from '@/lib/vault-client';

const ASSET_TYPES = [
    { value: 'ACCOUNT', label: 'Cuenta' },
    { value: 'FUND', label: 'Fondo' },
    { value: 'STOCK', label: 'Acciones' },
    { value: 'CRYPTO', label: 'Crypto' },
    { value: 'OTHER', label: 'Otro' },
];

export default function NewAssetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        asset_type: 'ACCOUNT',
        current_value: '',
        currency: 'EUR',
        account_number: '',
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
            await vaultClient.createAsset(id, {
                ...formData,
                current_value: formData.current_value ? parseFloat(formData.current_value) : undefined,
            });
            router.push(`/finanzas/vault/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear el activo');
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
                        <Wallet className="h-5 w-5 text-emerald-600" />
                        Nuevo Activo
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Cuenta Nómina, Cartera CT..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                    />
                </div>

                <div>
                    <label htmlFor="asset_type" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                    </label>
                    <select
                        id="asset_type"
                        value={formData.asset_type}
                        onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                        {ASSET_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="current_value" className="block text-sm font-medium text-gray-700 mb-1">
                            Valor actual
                        </label>
                        <input
                            id="current_value"
                            type="number"
                            step="0.01"
                            value={formData.current_value}
                            onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                            placeholder="15000"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                            Moneda
                        </label>
                        <select
                            id="currency"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de cuenta (opcional)
                    </label>
                    <input
                        id="account_number"
                        type="text"
                        value={formData.account_number}
                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                        placeholder="ES12 3456 7890..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
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
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
}
