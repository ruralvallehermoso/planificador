"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";

interface HistoryPoint {
    date: string;
    value: number;
}

interface Performance {
    current_value: number;
    change_percent: number;
    change_absolute: number;
}

export function PortfolioMasterCard() {
    const [performance, setPerformance] = useState<Performance | null>(null);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [perfRes, histRes] = await Promise.all([
                    fetch("http://localhost:8000/api/portfolio/performance?period=24h"),
                    fetch("http://localhost:8000/api/portfolio/history?period=24h")
                ]);

                if (perfRes.ok && histRes.ok) {
                    const perfData = await perfRes.json();
                    const histData = await histRes.json();
                    setPerformance(perfData);
                    setHistory(histData);
                }
            } catch (error) {
                console.error("Error fetching Portfolio Master data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-gray-100" />
                <div className="mt-4 h-6 w-24 bg-gray-100 rounded" />
                <div className="mt-2 h-8 w-32 bg-gray-100 rounded" />
                <div className="mt-4 h-12 w-full bg-gray-50 rounded" />
            </div>
        );
    }

    if (!performance) return null;

    const isPositive = performance.change_percent >= 0;

    // Simple Sparkline generation
    const minVal = Math.min(...history.map(h => h.value));
    const maxVal = Math.max(...history.map(h => h.value));
    const range = maxVal - minVal || 1;
    const points = history.map((h, i) => {
        const x = (i / (history.length - 1)) * 100;
        const y = 40 - ((h.value - minVal) / range) * 30; // 30px height, 40px viewbox height
        return `${x},${y}`;
    }).join(" ");

    return (
        <Link
            href="/finanzas/portfolio"
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-indigo-300"
        >
            <div className="flex items-center justify-between">
                <div
                    className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}
                >
                    {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div className={clsx(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                )}>
                    {isPositive ? "+" : ""}{performance.change_percent.toFixed(2)}%
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Portfolio Master</h3>
                <p className="mt-1 text-2xl font-bold text-gray-900 tracking-tight">
                    €{performance.current_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
            </div>

            <div className="mt-4 h-12 w-full">
                {history.length > 1 ? (
                    <svg className="h-full w-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                        />
                        {/* Gradient Area */}
                        <path
                            d={`M 0 40 L ${points} L 100 40 Z`}
                            fill={isPositive ? "url(#grad-pos)" : "url(#grad-neg)"}
                            fillOpacity="0.1"
                        />
                        <defs>
                            <linearGradient id="grad-pos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="grad-neg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400 italic">
                        Sin datos históricos 24h
                    </div>
                )}
            </div>
        </Link>
    );
}
