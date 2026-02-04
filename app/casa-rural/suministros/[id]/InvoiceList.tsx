"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addInvoice, deleteInvoice, type InvoiceData } from "@/app/actions/suministros";
import { Plus, Trash2, FileText, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Invoice {
    id: number;
    invoiceNumber: string | null;
    date: Date;
    amount: number;
    pdfUrl: string | null;
    notes: string | null;
}

interface Props {
    suministroId: number;
    invoices: Invoice[];
}

export function InvoiceList({ suministroId, invoices }: Props) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [form, setForm] = useState<InvoiceData>({
        invoiceNumber: "",
        date: new Date(),
        amount: 0,
        pdfUrl: "",
        notes: "",
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await addInvoice(suministroId, form);

        if (result.success) {
            router.refresh();
            setShowForm(false);
            setForm({ invoiceNumber: "", date: new Date(), amount: 0, pdfUrl: "", notes: "" });
        }
        setSaving(false);
    };

    const handleDelete = async (invoiceId: number) => {
        if (!confirm("¿Eliminar esta factura?")) return;

        setDeletingId(invoiceId);
        await deleteInvoice(invoiceId, suministroId);
        router.refresh();
        setDeletingId(null);
    };

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Facturas</h2>
                    <p className="text-sm text-gray-500">
                        {invoices.length} facturas · Total: €{totalAmount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Añadir
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nº Factura</label>
                            <input
                                type="text"
                                value={form.invoiceNumber || ""}
                                onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                placeholder="F-001"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                            <input
                                type="date"
                                value={form.date instanceof Date ? form.date.toISOString().split("T")[0] : ""}
                                onChange={(e) => setForm({ ...form, date: new Date(e.target.value) })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Importe (€) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.amount || ""}
                                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">PDF URL</label>
                            <input
                                type="url"
                                value={form.pdfUrl || ""}
                                onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                            Guardar
                        </button>
                    </div>
                </form>
            )}

            {invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay facturas registradas</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        €{invoice.amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                                        {invoice.invoiceNumber && (
                                            <span className="ml-2 text-gray-400 font-normal">#{invoice.invoiceNumber}</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(invoice.date), "d MMM yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {invoice.pdfUrl && (
                                    <a
                                        href={invoice.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleDelete(invoice.id)}
                                    disabled={deletingId === invoice.id}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {deletingId === invoice.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
