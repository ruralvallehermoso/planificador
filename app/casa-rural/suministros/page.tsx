import Link from "next/link";
import { getSuministros } from "@/app/actions/suministros";
import { Plus, Zap } from "lucide-react";
import { SuministroCard } from "./SuministroCard";

export default async function SuministrosPage() {
    const suministros = await getSuministros();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suministros</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gestiona los proveedores de servicios
                    </p>
                </div>
                <Link
                    href="/casa-rural/suministros/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Añadir Suministro
                </Link>
            </div>

            {suministros.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay suministros</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Añade tu primer proveedor de servicios
                    </p>
                    <Link
                        href="/casa-rural/suministros/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Añadir Suministro
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {suministros.map((suministro) => (
                        <SuministroCard key={suministro.id} suministro={suministro} />
                    ))}
                </div>
            )}
        </div>
    );
}
