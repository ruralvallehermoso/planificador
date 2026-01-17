"use client";

import { useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export function PortfolioRefreshButton() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    async function handleRefresh() {
        setLoading(true);
        setStatus("idle");
        try {
            const finanzasBackendUrl = process.env.NEXT_PUBLIC_FINANZAS_BACKEND_URL || 'https://backend-rho-two-p1x4gg922k.vercel.app';
            const res = await fetch(`${finanzasBackendUrl}/api/update_markets`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error("Failed to update");

            setStatus("success");
            // Reload page to refresh microfrontend
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error(error);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleRefresh}
            disabled={loading || status === "success"}
            className={clsx(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all shadow-sm",
                status === "idle" && "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
                status === "success" && "bg-green-50 text-green-700 border border-green-200",
                status === "error" && "bg-red-50 text-red-700 border border-red-200",
                loading && "opacity-80 cursor-wait"
            )}
        >
            {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
                <Check className="h-4 w-4" />
            ) : status === "error" ? (
                <AlertCircle className="h-4 w-4" />
            ) : (
                <RefreshCw className="h-4 w-4" />
            )}
            {loading ? "Actualizando..." : status === "success" ? "Actualizado" : status === "error" ? "Error" : "Actualizar Precios"}
        </button>
    );
}
