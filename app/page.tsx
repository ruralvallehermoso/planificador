import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock, Home as HomeIcon, Wallet, GraduationCap, Coffee, BookOpen, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";
import { auth } from "@/auth";
import { canAccessModule } from "@/lib/auth/permissions";
import { MODULES, type ModuleName } from "@/lib/auth/config";
import { CasaRuralFinancialCard } from "@/components/dashboard/CasaRuralFinancialCard";
import { PortfolioCard } from "@/components/dashboard/PortfolioCard";
import { SimulatorCard } from "@/components/dashboard/SimulatorCard";

import { TaxAlert } from "@/components/dashboard/TaxAlert";

// Map category slugs to module names and icons
const MODULES_CONFIG: Record<string, { module: ModuleName; icon: any; color: string; tasksPath: string }> = {
  'casa-rural': { module: MODULES.CASA_RURAL, icon: HomeIcon, color: '#10b981', tasksPath: '/casa-rural/contabilidad' },
  'finanzas': { module: MODULES.FINANZAS, icon: Wallet, color: '#6366f1', tasksPath: '/finanzas' },
  'fp-informatica': { module: MODULES.FP_INFORMATICA, icon: GraduationCap, color: '#f59e0b', tasksPath: '/fp-informatica' },
  'hogar': { module: MODULES.HOGAR, icon: Coffee, color: '#ec4899', tasksPath: '/hogar/tareas' },
  'master-unie': { module: MODULES.MASTER_UNIE, icon: BookOpen, color: '#8b5cf6', tasksPath: '/master-unie' },
};

/* Server Component */
export default async function Home() {
  console.log("Planificador Deployment User Triggered Verify v1");

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

  // Enforce permission filtering
  const BYPASS_PERMISSIONS = false;
  const categories = BYPASS_PERMISSIONS ? allCategories : allCategories.filter(category => {
    const config = MODULES_CONFIG[category.slug];
    if (!config) return true;
    return canAccessModule(user || null, config.module);
  });

  // Fetch pending Master Tasks count and preview items separately
  const [pendingMasterTasksCount, pendingMasterTasks] = user ? await Promise.all([
    prisma.masterTask.count({
      where: {
        userId: user.id,
        completed: false
      }
    }),
    prisma.masterTask.findMany({
      where: {
        userId: user.id,
        completed: false
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true }
    })
  ]) : [0, []];

  // Merge Master Tasks count into categories
  const categoriesWithMaster = categories.map(cat => {
    if (cat.slug === 'master-unie') {
      return {
        ...cat,
        _count: { items: pendingMasterTasksCount },
        items: pendingMasterTasks.map(t => ({
          id: t.id,
          title: t.title,
          status: 'TODO',
          priority: 'MEDIUM'
        }))
      }
    }
    return cat;
  });

  // Calculate total pending
  const totalPending = categoriesWithMaster.reduce((sum, c) => sum + c._count.items, 0);

  // Financial module access check
  const showFinances = canAccessModule(user || null, MODULES.FINANZAS) || BYPASS_PERMISSIONS;

  return (
    <div className="space-y-8">
      {/* Alert Section */}
      <TaxAlert />

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

      {/* Financial Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {canAccessModule(user || null, MODULES.CASA_RURAL) && <CasaRuralFinancialCard />}
        {showFinances && <PortfolioCard />}
        {showFinances && <SimulatorCard />}
      </div>

      {/* Pending Tasks Overview - Main Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categoriesWithMaster.map((category) => {
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
                  : "bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md"
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
    </div>
  );
}
