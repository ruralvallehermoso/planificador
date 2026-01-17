"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

interface SimulatorData {
    balance: number;
    portfolio_value?: number;
    portfolio_basis?: number;
    total_interest_paid?: number;
}

export function SimulatorCard() {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Fetch logic
    async function fetchData() {
        setLoading(true);
        setError(false);
        try {
            const finanzasBackendUrl = process.env.NEXT_PUBLIC_FINANZAS_BACKEND_URL || 'https://backend-rho-two-p1x4gg922k.vercel.app';
            const TAX_RATE = 0.19;

            // Use Client-side fetch
            const res = await fetch(`${finanzasBackendUrl}/api/simulator/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mortgage: { principal: 127000, annual_rate: 2.5, years: 15 },
                    tax_rate: TAX_RATE * 100,
                    start_date: "2025-11-24"
                }),
                cache: 'no-store'
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const json: SimulatorData = await res.json();

            // Recalculate with adjustment for Margarita's fund withdrawal (16/01/2026).
            // User requested to adjust the initial value (basis) by subtracting 9500.
            if (typeof json.portfolio_value === 'number' && typeof json.portfolio_basis === 'number' && typeof json.total_interest_paid === 'number') {
                const adjustedBasis = json.portfolio_basis - 9500;
                const adjustedProfit = json.portfolio_value - adjustedBasis;
                const netBenefit = adjustedProfit * (1 - TAX_RATE);
                const adjustedBalance = netBenefit - json.total_interest_paid;
                setBalance(adjustedBalance);
            } else {
                // Fallback if detailed fields are missing
                setBalance(json.balance + (9500 * (1 - 0.19)));
            }
        } catch (err) {
            console.error("Failed to load simulator data", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Loading Skeleton - Matching PortfolioCard style
    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 h-[180px] flex flex-col justify-between">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-28 bg-gray-100 rounded-md" />
                        <div className="h-5 w-20 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-32 bg-gray-100 rounded-md" />
                </div>
                <div className="h-4 w-24 bg-gray-100 rounded-md self-end" />
            </div>
        );
    }

    // Error State
    if (error || balance === null) {
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

    const isHealthy = balance >= 0;

    return (
        <Link
            href="/finanzas/simulador"
            className={clsx(
                "group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] h-[180px] flex flex-col justify-between",
                isHealthy
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                    : "bg-gradient-to-br from-red-500 to-rose-600"
            )}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative w-full">
                <div className="flex items-center justify-between mb-2">
                    <span className={clsx(
                        "text-sm font-medium",
                        isHealthy ? "text-emerald-200" : "text-red-200"
                    )}>
                        Plan Financiero
                    </span>
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                        isHealthy
                            ? "bg-green-400/20 text-green-200"
                            : "bg-red-400/20 text-red-200"
                    )}>
                        {isHealthy ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {isHealthy ? 'Saludable' : 'Riesgo'}
                    </div>
                </div>

                <p className="text-4xl font-bold tracking-tight mb-1">
                    €{Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className={clsx(
                    "text-sm",
                    isHealthy ? "text-emerald-200" : "text-red-200"
                )}>
                    {isHealthy
                        ? 'Saldo proyectado positivo'
                        : 'Déficit proyectado'
                    }
                </p>
            </div>

            <div className={clsx(
                "relative mt-auto pt-2 flex items-center justify-end text-sm group-hover:text-white transition-colors",
                isHealthy ? "text-emerald-200" : "text-red-200"
            )}>
                Ver simulador <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}
