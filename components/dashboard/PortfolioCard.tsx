"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface PortfolioData {
    current_value: number;
    change_percent: number;
}

export function PortfolioCard() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Fetch logic
    async function fetchData() {
        setLoading(true);
        setError(false);
        try {
            const finanzasBackendUrl = process.env.NEXT_PUBLIC_FINANZAS_BACKEND_URL || 'https://backend-rho-two-p1x4gg922k.vercel.app';
            // Use Client-side fetch
            const res = await fetch(`${finanzasBackendUrl}/api/portfolio/performance?period=24h`, {
                cache: 'no-store'
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Failed to load portfolio data", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Loading Skeleton - "Elegant"
    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 h-[180px] flex flex-col justify-between">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-24 bg-gray-100 rounded-md" />
                        <div className="h-5 w-16 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-10 w-40 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-32 bg-gray-100 rounded-md" />
                </div>
                <div className="h-4 w-20 bg-gray-100 rounded-md self-end" />
            </div>
        );
    }

    // Error State
    if (error || !data) {
        return (
            <div className="group relative overflow-hidden rounded-2xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200 h-[180px] flex flex-col justify-center items-center text-center">
                <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-500 mb-4">No se pudo cargar</p>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                >
                    <RefreshCw className="h-3 w-3" /> Reintentar
                </button>
            </div>
        );
    }

    return (
        <Link
            href="/finanzas/portfolio"
            onClick={() => setIsNavigating(true)}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] h-[180px] flex flex-col justify-between"
        >
            {isNavigating && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative w-full">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-200 text-sm font-medium">Portfolio Master</span>
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                        data.change_percent >= 0
                            ? "bg-green-400/20 text-green-200"
                            : "bg-red-400/20 text-red-200"
                    )}>
                        {data.change_percent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {data.change_percent >= 0 ? '+' : ''}{data.change_percent.toFixed(2)}%
                    </div>
                </div>

                <p className="text-4xl font-bold tracking-tight mb-1">
                    €{data.current_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-indigo-200 text-sm">Valor actual del patrimonio</p>
            </div>

            <div className="relative mt-auto pt-2 flex items-center justify-end text-indigo-200 text-sm group-hover:text-white transition-colors">
                Ver cartera <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}
