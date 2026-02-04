import { notFound } from "next/navigation";
import Link from "next/link";
import { getSuministro } from "@/app/actions/suministros";
import { ArrowLeft, ExternalLink, Phone, Mail, FileText, Zap, Droplets, Flame, Wifi, MoreHorizontal } from "lucide-react";
import { SuministroEditForm } from "./SuministroEditForm";
import { InvoiceList } from "./InvoiceList";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    LUZ: { icon: Zap, color: "#f59e0b", label: "Luz" },
    AGUA: { icon: Droplets, color: "#3b82f6", label: "Agua" },
    GAS: { icon: Flame, color: "#ef4444", label: "Gas" },
    INTERNET: { icon: Wifi, color: "#8b5cf6", label: "Internet" },
    TELEFONO: { icon: Phone, color: "#10b981", label: "Teléfono" },
    OTRO: { icon: MoreHorizontal, color: "#6b7280", label: "Otro" },
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SuministroDetailPage({ params }: PageProps) {
    const { id } = await params;
    const suministroId = parseInt(id, 10);

    if (isNaN(suministroId)) {
        notFound();
    }

    const suministro = await getSuministro(suministroId);

    if (!suministro) {
        notFound();
    }

    const config = TYPE_CONFIG[suministro.type] || TYPE_CONFIG.OTRO;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link
                    href="/casa-rural/suministros"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Suministros
                </Link>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
                <div className="flex items-start gap-4">
                    {suministro.logoUrl ? (
                        <img
                            src={suministro.logoUrl}
                            alt={suministro.name}
                            className="h-16 w-16 rounded-lg object-contain bg-gray-50"
                        />
                    ) : (
                        <div
                            className="h-16 w-16 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${config.color}15`, color: config.color }}
                        >
                            <config.icon className="h-8 w-8" />
                        </div>
                    )}

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{suministro.name}</h1>
                            <span
                                className="text-xs font-medium px-2 py-1 rounded-full"
                                style={{ backgroundColor: `${config.color}15`, color: config.color }}
                            >
                                {config.label}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                            {suministro.website && (
                                <a
                                    href={suministro.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 hover:text-emerald-600"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Web
                                </a>
                            )}
                            {suministro.contactPhone && (
                                <a
                                    href={`tel:${suministro.contactPhone}`}
                                    className="inline-flex items-center gap-1 hover:text-emerald-600"
                                >
                                    <Phone className="h-4 w-4" />
                                    {suministro.contactPhone}
                                </a>
                            )}
                            {suministro.contactEmail && (
                                <a
                                    href={`mailto:${suministro.contactEmail}`}
                                    className="inline-flex items-center gap-1 hover:text-emerald-600"
                                >
                                    <Mail className="h-4 w-4" />
                                    {suministro.contactEmail}
                                </a>
                            )}
                        </div>

                        {suministro.contractRef && (
                            <p className="text-sm text-gray-400 mt-2">
                                <FileText className="h-4 w-4 inline mr-1" />
                                Ref: {suministro.contractRef}
                            </p>
                        )}
                    </div>
                </div>

                {suministro.notes && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{suministro.notes}</p>
                    </div>
                )}
            </div>

            {/* Edit Form */}
            <SuministroEditForm suministro={suministro} />

            {/* Invoices */}
            <InvoiceList
                suministroId={suministro.id}
                invoices={suministro.invoices.map((inv) => ({
                    ...inv,
                    amount: Number(inv.amount),
                }))}
            />
        </div>
    );
}
