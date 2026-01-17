
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home as HomeIcon, TrendingUp, TrendingDown, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { getCasaRuralYearlyBalance } from "@/app/actions/casa-rural-finances";

export function CasaRuralFinancialCard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const result = await getCasaRuralYearlyBalance();
            if (result.success) {
                setData(result);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

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
                    <div className="flex gap-4">
                        <div className="h-3 w-16 bg-gray-100 rounded-md" />
                        <div className="h-3 w-16 bg-gray-100 rounded-md" />
                    </div>
                </div>
                <div className="h-4 w-24 bg-gray-100 rounded-md self-end" />
            </div>
        );
    }

    if (!data) return null;

    const { balance, income, expenses, isHealthy, year } = data;

    return (
        <Link
            href="/casa-rural/contabilidad"
            className={clsx(
                "group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] h-[180px] flex flex-col justify-between",
                isHealthy
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                    : "bg-gradient-to-br from-orange-500 to-amber-600"
            )}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative w-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <HomeIcon className="h-4 w-4 text-white/80" />
                        <span className="text-sm font-medium text-white/90">Casa Rural {year}</span>
                    </div>
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                        isHealthy
                            ? "bg-white/20 text-white"
                            : "bg-white/20 text-white"
                    )}>
                        {isHealthy ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {isHealthy ? 'Saludable' : 'Pérdidas'}
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-4xl font-bold tracking-tight">
                        {balance < 0 ? '-' : ''}€{Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <span className="text-white/60 text-xs font-medium">Neto</span>
                </div>

                <div className="flex gap-4 mt-1">
                    <div className="flex items-center gap-1 text-xs text-white/80">
                        <TrendingUp className="h-3 w-3 text-emerald-300" />
                        <span>€{income.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                        <TrendingDown className="h-3 w-3 text-orange-300" />
                        <span>€{expenses.toLocaleString()}</span>
                    </div>
                </div>

                <div className="relative mt-auto pt-2 flex items-center justify-end text-sm text-white/90 group-hover:text-white transition-colors">
                    Ver contabilidad <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
}
