"use client";

import Link from "next/link";
import { Zap, Droplets, Flame, Wifi, Phone, MoreHorizontal, ExternalLink, FileText } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    LUZ: { icon: Zap, color: "#f59e0b", label: "Luz" },
    AGUA: { icon: Droplets, color: "#3b82f6", label: "Agua" },
    GAS: { icon: Flame, color: "#ef4444", label: "Gas" },
    INTERNET: { icon: Wifi, color: "#8b5cf6", label: "Internet" },
    TELEFONO: { icon: Phone, color: "#10b981", label: "Teléfono" },
    OTRO: { icon: MoreHorizontal, color: "#6b7280", label: "Otro" },
};

interface SuministroCardProps {
    suministro: {
        id: number;
        name: string;
        type: string;
        website: string | null;
        contactPhone: string | null;
        contractRef: string | null;
        _count: {
            invoices: number;
        };
    };
}

export function SuministroCard({ suministro }: SuministroCardProps) {
    const config = TYPE_CONFIG[suministro.type] || TYPE_CONFIG.OTRO;
    const Icon = config.icon;

    return (
        <Link
            href={`/casa-rural/suministros/${suministro.id}`}
            className="group bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-gray-300 transition-all"
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
                    {config.label}
                </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                {suministro.name}
            </h3>

            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                {suministro.website && (
                    <a
                        href={suministro.website.startsWith('http') ? suministro.website : `https://${suministro.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Web
                    </a>
                )}
                {suministro.contactPhone && (
                    <a
                        href={`tel:${suministro.contactPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 hover:underline"
                    >
                        <Phone className="h-3 w-3" />
                        {suministro.contactPhone}
                    </a>
                )}
                <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {suministro._count.invoices} facturas
                </span>
            </div>

            {suministro.contractRef && (
                <p className="text-xs text-gray-400 mt-2 truncate">
                    Ref: {suministro.contractRef}
                </p>
            )}
        </Link>
    );
}
