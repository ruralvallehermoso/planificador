import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock, Home, Wallet, GraduationCap, Coffee, BookOpen, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";
import { auth } from "@/auth";
import { canAccessModule } from "@/lib/auth/permissions";
import { MODULES, type ModuleName } from "@/lib/auth/config";

// Map category slugs to module names and icons
const MODULES_CONFIG: Record<string, { module: ModuleName; icon: any; color: string; tasksPath: string }> = {
  'casa-rural': { module: MODULES.CASA_RURAL, icon: Home, color: '#10b981', tasksPath: '/casa-rural/tareas' },
  'finanzas': { module: MODULES.FINANZAS, icon: Wallet, color: '#6366f1', tasksPath: '/finanzas' },
  'fp-informatica': { module: MODULES.FP_INFORMATICA, icon: GraduationCap, color: '#f59e0b', tasksPath: '/fp-informatica' },
  'hogar': { module: MODULES.HOGAR, icon: Coffee, color: '#ec4899', tasksPath: '/hogar/tareas' },
  'master-unie': { module: MODULES.MASTER_UNIE, icon: BookOpen, color: '#8b5cf6', tasksPath: '/master-unie' },
};

/* Server Component */
export default async function Home() {
  const session = await auth();
  const user = session?.user;

  // Get all categories with their pending tasks count
  const allCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { items: { where: { status: { not: "DONE" } } } },
      },
      items: {
        where: { status: { not: "DONE" } },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true, priority: true }
      }
    },
  });

  // TEMPORARY: Skip permission filtering
  const BYPASS_PERMISSIONS = true;
  const categories = BYPASS_PERMISSIONS ? allCategories : allCategories.filter(category => {
    const config = MODULES_CONFIG[category.slug];
    if (!config) return true;
    return canAccessModule(user || null, config.module);
  });

  // Calculate total pending
  const totalPending = categories.reduce((sum, c) => sum + c._count.items, 0);

  // Fetch financial data
  let portfolioData: { current_value: number; change_percent: number } | null = null;
  let simulatorBalance: number | null = null;

  if (canAccessModule(user || null, MODULES.FINANZAS) || BYPASS_PERMISSIONS) {
    const finanzasBackendUrl = process.env.FINANZAS_BACKEND_URL || 'https://backend-rho-two-p1x4gg922k.vercel.app';

    try {
      const [portfolioRes, simRes] = await Promise.all([
        fetch(`${finanzasBackendUrl}/api/portfolio/performance?period=24h`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        }),
        fetch(`${finanzasBackendUrl}/api/simulator/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mortgage: { principal: 127000, annual_rate: 2.5, years: 15 },
            tax_rate: 19,
            start_date: "2025-11-24"
          }),
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        })
      ]);

      if (portfolioRes.ok) {
        portfolioData = await portfolioRes.json();
      }
      if (simRes.ok) {
        const simData = await simRes.json();
        simulatorBalance = simData.balance || 0;
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching financial data:', error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with summary */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cuadro de Mandos</h1>
          <p className="mt-1 text-gray-500">
            {totalPending > 0
              ? `${totalPending} tareas pendientes en total`
              : 'Todo al día ✓'
            }
          </p>
        </div>
      </div>

      {/* Pending Tasks Overview - Main Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => {
          const config = MODULES_CONFIG[category.slug];
          const Icon = config?.icon || Circle;
          const color = config?.color || '#6366f1';
          const hasPending = category._count.items > 0;

          return (
            <Link
              key={category.id}
              href={config?.tasksPath || `/${category.slug}`}
              className={clsx(
                "group relative rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]",
                hasPending
                  ? "bg-gradient-to-br from-white to-gray-50 shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-2"
                  : "bg-gray-50/50 ring-1 ring-gray-100 hover:bg-white hover:shadow-sm"
              )}
              style={hasPending ? { '--ring-color': color } as any : {}}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div
                  className={clsx(
                    "flex items-center justify-center min-w-[2.5rem] h-8 rounded-full font-bold text-sm",
                    hasPending ? "text-white" : "text-gray-400 bg-gray-100"
                  )}
                  style={hasPending ? { backgroundColor: color } : {}}
                >
                  {category._count.items}
                </div>
              </div>

              {/* Module Name */}
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                {category.name}
              </h3>

              {/* Preview of pending tasks */}
              {hasPending && category.items.length > 0 ? (
                <ul className="space-y-1.5">
                  {category.items.slice(0, 2).map((task) => (
                    <li key={task.id} className="flex items-center gap-2 text-xs text-gray-600">
                      <div
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">{task.title}</span>
                    </li>
                  ))}
                  {category._count.items > 2 && (
                    <li className="text-xs text-gray-400 pl-3.5">
                      +{category._count.items - 2} más
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">Sin tareas pendientes</p>
              )}

              {/* Hover arrow */}
              <ArrowUpRight
                className="absolute top-4 right-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color }}
              />
            </Link>
          );
        })}
      </div>

      {/* Financial Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Portfolio Master Card */}
        {portfolioData && portfolioData.current_value > 0 && (
          <Link
            href="/finanzas/portfolio"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-200 text-sm font-medium">Portfolio Master</span>
                <div className={clsx(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                  portfolioData.change_percent >= 0
                    ? "bg-green-400/20 text-green-200"
                    : "bg-red-400/20 text-red-200"
                )}>
                  {portfolioData.change_percent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {portfolioData.change_percent >= 0 ? '+' : ''}{portfolioData.change_percent.toFixed(2)}%
                </div>
              </div>

              <p className="text-4xl font-bold tracking-tight mb-1">
                €{portfolioData.current_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-indigo-200 text-sm">Valor actual del patrimonio</p>

              <div className="mt-4 flex items-center text-indigo-200 text-sm group-hover:text-white transition-colors">
                Ver cartera <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        )}

        {/* Plan Financiero Card */}
        {simulatorBalance !== null && (
          <Link
            href="/finanzas/simulador"
            className={clsx(
              "group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]",
              simulatorBalance >= 0
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : "bg-gradient-to-br from-red-500 to-rose-600"
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className={clsx(
                  "text-sm font-medium",
                  simulatorBalance >= 0 ? "text-emerald-200" : "text-red-200"
                )}>
                  Plan Financiero
                </span>
                <div className={clsx(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                  simulatorBalance >= 0
                    ? "bg-green-400/20 text-green-200"
                    : "bg-red-400/20 text-red-200"
                )}>
                  {simulatorBalance >= 0 ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {simulatorBalance >= 0 ? 'Saludable' : 'Riesgo'}
                </div>
              </div>

              <p className="text-4xl font-bold tracking-tight mb-1">
                €{Math.abs(simulatorBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className={clsx(
                "text-sm",
                simulatorBalance >= 0 ? "text-emerald-200" : "text-red-200"
              )}>
                {simulatorBalance >= 0
                  ? 'Saldo proyectado positivo'
                  : 'Déficit proyectado'
                }
              </p>

              <div className={clsx(
                "mt-4 flex items-center text-sm group-hover:text-white transition-colors",
                simulatorBalance >= 0 ? "text-emerald-200" : "text-red-200"
              )}>
                Ver simulador <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
