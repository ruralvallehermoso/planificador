import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    Utensils,
    ShoppingCart,
    ClipboardCheck,
    Calendar,
    Package,
    ArrowRight,
    ChefHat,
    Sparkles
} from "lucide-react";
import { clsx } from "clsx";

/* Server Component */
export default async function HogarPage() {
    const session = await auth();
    const user = session?.user;

    // Fetch data in parallel
    const [recipesCount, pendingTasksCount] = await Promise.all([
        prisma.recipe.count(),
        prisma.actionItem.count({
            where: {
                category: { slug: 'hogar' },
                status: { not: "DONE" }
            }
        })
    ]);

    const CARDS = [
        {
            title: "Recetas y Comidas",
            description: "Gestiona tu recetario y planifica el menú semanal.",
            href: "/hogar/comidas",
            icon: Utensils,
            color: "#f97316", // Orange-500
            count: recipesCount,
            countLabel: "recetas",
            bgGradient: "from-orange-50 to-amber-50"
        },
        {
            title: "Lista de la Compra",
            description: "Añade productos y organiza tu próxima visita al supermercado.",
            href: "/hogar/lista-compra",
            icon: ShoppingCart,
            color: "#10b981", // Emerald-500
            count: null,
            bgGradient: "from-emerald-50 to-green-50"
        },
        {
            title: "Tareas del Hogar",
            description: "Limpieza, mantenimiento y organización doméstica.",
            href: "/hogar/tareas",
            icon: ClipboardCheck,
            color: "#3b82f6", // Blue-500
            count: pendingTasksCount,
            countLabel: "pendientes",
            bgGradient: "from-blue-50 to-indigo-50"
        },
        {
            title: "Calendario Familiar",
            description: "Eventos, cumpleaños y fechas importantes.",
            href: "/hogar/calendario",
            icon: Calendar,
            color: "#8b5cf6", // Violet-500
            count: null,
            bgGradient: "from-violet-50 to-purple-50"
        }
    ];

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-amber-500" />
                    Hogar Digital
                </h1>
                <p className="text-gray-500 max-w-2xl text-lg">
                    Bienvenido a tu centro de control doméstico. Gestiona recetas, tareas y compras desde un único lugar.
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {CARDS.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className={clsx(
                            "group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                            "hover:shadow-lg hover:-translate-y-1 bg-white"
                        )}
                        style={{ borderColor: `${card.color}30` }}
                    >
                        {/* Background Gradient */}
                        <div className={clsx("absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity bg-gradient-to-br", card.bgGradient)} />

                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div className="flex items-start justify-between">
                                <div
                                    className="p-3 rounded-xl transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${card.color}20`, color: card.color }}
                                >
                                    <card.icon className="w-8 h-8" />
                                </div>
                                <div className="p-2 rounded-full bg-white/50 group-hover:bg-white/80 transition-colors">
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                                    {card.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {card.description}
                                </p>
                            </div>

                            {card.count !== null && (
                                <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-white/60 border border-gray-100 w-fit">
                                    <span style={{ color: card.color }}>{card.count}</span>
                                    <span className="text-gray-500">{card.countLabel}</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}

                {/* Proposal Card: Inventory / Pantry */}
                <div className="group relative overflow-hidden rounded-2xl border border-dashed border-gray-300 p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-600">
                            PRÓXIMAMENTE
                        </span>
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between gap-4 opacity-75 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-start justify-between">
                            <div className="p-3 rounded-xl bg-gray-200 text-gray-500">
                                <Package className="w-8 h-8" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-700">
                                Despensa Inteligente
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Controla tu inventario, fechas de caducidad y sugerencias de recetas basadas en lo que tienes.
                            </p>
                        </div>

                        <div className="mt-2 text-sm text-gray-400 italic">
                            ¿Te gustaría tener esta funcionalidad?
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
