import { AlertTriangle, AlertCircle, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

export type AlertType = 'warning' | 'error' | 'success' | 'info';

export interface Alert {
    id: string;
    type: AlertType;
    title: string;
    message: string;
    link?: string;
    linkText?: string;
    chartData?: number[];
    trend?: number;
}

interface AlertsSectionProps {
    alerts: Alert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Avisos Importantes
            </h2>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                {alerts.map((alert) => {
                    const isPositive = (alert.trend ?? 0) >= 0;

                    // Simple Sparkline generation
                    let points = "";
                    if (alert.chartData && alert.chartData.length > 1) {
                        const minVal = Math.min(...alert.chartData);
                        const maxVal = Math.max(...alert.chartData);
                        const range = maxVal - minVal || 1;
                        points = alert.chartData.map((v, i) => {
                            const x = (i / (alert.chartData!.length - 1)) * 100;
                            const y = 30 - ((v - minVal) / range) * 20; // 20px height, 30px viewbox height
                            return `${x},${y}`;
                        }).join(" ");
                    }

                    return (
                        <div
                            key={alert.id}
                            className={clsx(
                                "rounded-xl border p-4 shadow-sm transition-all flex flex-col justify-between",
                                {
                                    'bg-amber-50 border-amber-200': alert.type === 'warning',
                                    'bg-red-50 border-red-200': alert.type === 'error',
                                    'bg-blue-50 border-blue-200': alert.type === 'info',
                                    'bg-green-50 border-green-200': alert.type === 'success',
                                }
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={clsx(
                                    "p-2 rounded-full shrink-0",
                                    {
                                        'bg-amber-100 text-amber-600': alert.type === 'warning',
                                        'bg-red-100 text-red-600': alert.type === 'error',
                                        'bg-blue-100 text-blue-600': alert.type === 'info',
                                        'bg-green-100 text-green-600': alert.type === 'success',
                                    }
                                )}>
                                    {alert.id === 'portfolio-master-alert' ? (
                                        <TrendingUp className="w-5 h-5" />
                                    ) : alert.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={clsx(
                                            "text-base font-semibold",
                                            {
                                                'text-amber-900': alert.type === 'warning',
                                                'text-red-900': alert.type === 'error',
                                                'text-blue-900': alert.type === 'info',
                                                'text-green-900': alert.type === 'success',
                                            }
                                        )}>
                                            {alert.title}
                                        </h3>
                                        {alert.trend !== undefined && (
                                            <span className={clsx(
                                                "text-xs font-bold px-2 py-0.5 rounded-full",
                                                isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {isPositive ? "+" : ""}{alert.trend.toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                    <p className={clsx(
                                        "mt-1 text-sm whitespace-pre-line",
                                        {
                                            'text-amber-800': alert.type === 'warning',
                                            'text-red-800': alert.type === 'error',
                                            'text-blue-800': alert.type === 'info',
                                            'text-green-800': alert.type === 'success',
                                        }
                                    )}>
                                        {alert.message}
                                    </p>

                                    {alert.chartData && alert.chartData.length > 1 && (
                                        <div className="mt-2 h-8 w-full">
                                            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                                                <polyline
                                                    fill="none"
                                                    stroke={isPositive ? "#10b981" : "#ef4444"}
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    points={points}
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {alert.link && (
                                <div className="mt-3 flex justify-end">
                                    <Link
                                        href={alert.link}
                                        className={clsx(
                                            "text-sm font-medium flex items-center transition-opacity hover:opacity-80",
                                            {
                                                'text-amber-700': alert.type === 'warning',
                                                'text-red-700': alert.type === 'error',
                                                'text-blue-700': alert.type === 'info',
                                                'text-green-700': alert.type === 'success',
                                            }
                                        )}
                                    >
                                        {alert.linkText || 'Ver detalles'}
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
