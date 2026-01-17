import Link from 'next/link';
import { LayoutDashboard, Wallet, CalendarDays, Users, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { CasaRuralFinancialCard } from "@/components/dashboard/CasaRuralFinancialCard";

export default function CasaRuralPage() {
    // Basic navigation configuration
    const sections = [
        {
            title: "Gestión de Tareas",
            description: "Control de limpieza y mantenimiento",
            href: "/casa-rural/tareas",
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "Gestión de Actividades",
            description: "Registro de actividades y eventos",
            href: "/casa-rural/actividades",
            icon: CalendarDays,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100"
        },
        {
            title: "SES Hospedajes",
            description: "Registro de viajeros y partes de entrada",
            href: "/casa-rural/ses-hospedajes",
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100"
        }
        // Contabilidad is handled by the large card
    ];

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Casa Rural Dashboard</h1>
                    <p className="mt-1 text-slate-500">Gestión integral del alojamiento</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Reusing the nice financial card but perhaps making it clickable to details */}
                <div className="md:col-span-2 lg:col-span-1">
                    <CasaRuralFinancialCard />
                </div>

                {sections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className={`group relative flex flex-col justify-between rounded-2xl p-6 border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-white ${section.border}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl ${section.bg} ${section.color}`}>
                                <section.icon className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-slate-700">
                                {section.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {section.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
