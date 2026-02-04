"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSuministro, deleteSuministro, type SuministroData } from "@/app/actions/suministros";
import { Save, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const TYPES = [
    { value: "LUZ", label: "Luz" },
    { value: "AGUA", label: "Agua" },
    { value: "GAS", label: "Gas" },
    { value: "INTERNET", label: "Internet" },
    { value: "TELEFONO", label: "Teléfono" },
    { value: "OTRO", label: "Otro" },
];

interface Props {
    suministro: {
        id: number;
        name: string;
        type: string;
        website: string | null;
        logoUrl: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        contractRef: string | null;
        notes: string | null;
    };
}

export function SuministroEditForm({ suministro }: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<SuministroData>({
        name: suministro.name,
        type: suministro.type,
        website: suministro.website || "",
        logoUrl: suministro.logoUrl || "",
        contactPhone: suministro.contactPhone || "",
        contactEmail: suministro.contactEmail || "",
        contractRef: suministro.contractRef || "",
        notes: suministro.notes || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError("El nombre es obligatorio");
            return;
        }

        setSaving(true);
        setError(null);

        const result = await updateSuministro(suministro.id, form);

        if (result.success) {
            router.refresh();
            setIsOpen(false);
        } else {
            setError(result.error || "Error al guardar");
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!confirm("¿Eliminar este suministro y todas sus facturas?")) return;

        setDeleting(true);
        const result = await deleteSuministro(suministro.id);

        if (result.success) {
            router.push("/casa-rural/suministros");
        } else {
            setError(result.error || "Error al eliminar");
            setDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-xl"
            >
                <span className="font-medium text-gray-900">Editar Información</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
            </button>

            {isOpen && (
                <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                {TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Web</label>
                            <input
                                type="url"
                                value={form.website || ""}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                            <input
                                type="url"
                                value={form.logoUrl || ""}
                                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                value={form.contactPhone || ""}
                                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.contactEmail || ""}
                                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia Contrato</label>
                        <input
                            type="text"
                            value={form.contractRef || ""}
                            onChange={(e) => setForm({ ...form, contractRef: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                            value={form.notes || ""}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Eliminar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
