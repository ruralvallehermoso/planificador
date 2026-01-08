import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock, TrendingUp } from "lucide-react";
import { clsx } from "clsx";
import type { ActionItem, Category } from "@/prisma/generated/prisma";
import { AlertsSection, type Alert } from "@/components/dashboard/AlertsSection";
import { auth } from "@/auth";
import { canAccessModule, getAccessibleModules } from "@/lib/auth/permissions";
import { MODULES, type ModuleName } from "@/lib/auth/config";

// Map category slugs to module names
const SLUG_TO_MODULE: Record<string, ModuleName> = {
  'casa-rural': MODULES.CASA_RURAL,
  'finanzas': MODULES.FINANZAS,
  'fp-informatica': MODULES.FP_INFORMATICA,
  'hogar': MODULES.HOGAR,
  'master-unie': MODULES.MASTER_UNIE,
};

/* Server Component */
export default async function Home() {
  const session = await auth();
  const user = session?.user;

  // DEBUG LOGS - Remove after fixing
  console.log('[Dashboard DEBUG] Session:', JSON.stringify(session, null, 2));
  console.log('[Dashboard DEBUG] User:', JSON.stringify(user, null, 2));
  console.log('[Dashboard DEBUG] User role:', user?.role);
  console.log('[Dashboard DEBUG] User permissions:', {
    canAccessCasaRural: user?.canAccessCasaRural,
    canAccessFinanzas: user?.canAccessFinanzas,
    canAccessFpInformatica: user?.canAccessFpInformatica,
    canAccessHogar: user?.canAccessHogar,
    canAccessMasterUnie: user?.canAccessMasterUnie,
  });

  const allCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { items: { where: { status: { not: "DONE" } } } }, // Count active tasks
      },
    },
  });

  console.log('[Dashboard DEBUG] All categories found:', allCategories.length);
  console.log('[Dashboard DEBUG] Category slugs:', allCategories.map(c => c.slug));

  // TEMPORARY: Skip permission filtering to diagnose the issue
  // The issue is that user permissions are not being passed correctly from the JWT
  const DEBUG_SKIP_PERMISSIONS = false; // Changed from true to test the fix

  let categories;
  if (DEBUG_SKIP_PERMISSIONS) {
    console.log('[Dashboard DEBUG] SKIPPING permission filter - showing all categories');
    categories = allCategories;
  } else {
    // Filter categories based on user permissions
    categories = allCategories.filter(category => {
      const module = SLUG_TO_MODULE[category.slug];
      // If no module mapping, show the category (e.g., dashboard)
      if (!module) {
        console.log(`[Dashboard DEBUG] Category ${category.slug}: No module mapping, showing`);
        return true;
      }
      // Check if user can access this module
      const hasAccess = canAccessModule(user || null, module);
      console.log(`[Dashboard DEBUG] Category ${category.slug} -> Module ${module}: hasAccess=${hasAccess}`);
      return hasAccess;
    });
  }

  console.log('[Dashboard DEBUG] Final categories count:', categories.length);

  // DEBUG: Log what the user object looks like for troubleshooting
  console.log('[Dashboard DEBUG] FULL USER OBJECT KEYS:', user ? Object.keys(user) : 'null');

  const recentItems = await prisma.actionItem.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  // --- Alerts Logic ---
  const alerts: Alert[] = [];

  // ... (keeping alerts logic same)

  // 1. Casa Rural Logic - Only show if user has access
  if (canAccessModule(user || null, MODULES.CASA_RURAL)) {
    const casaRural = allCategories.find(c => c.slug === 'casa-rural');
    const pendingTasks = casaRural?._count.items || 0;

    if (pendingTasks > 0) {
      alerts.push({
        id: 'casa-rural-tasks',
        type: 'warning',
        title: 'Casa Rural: Tareas Pendientes',
        message: `Tienes ${pendingTasks} tareas sin finalizar en la Casa Rural.`,
        link: '/casa-rural/tareas',
        linkText: 'Ver Tareas',
      });
    }
  }

  // 2. Financial Simulator Logic - Only show if user has access to Finanzas
  if (canAccessModule(user || null, MODULES.FINANZAS)) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const statusFilePath = path.join(process.cwd(), 'public', 'financial_status.json');

      if (fs.existsSync(statusFilePath)) {
        const fileContent = fs.readFileSync(statusFilePath, 'utf-8');
        const financialData = JSON.parse(fileContent);
        const balance = financialData.balance;

        if (balance >= 0) {
          alerts.push({
            id: 'financial-health',
            type: 'success',
            title: 'Plan Financiero Saludable',
            message: `El saldo proyectado es positivo (€${balance.toLocaleString()}). Tu plan de ahorro cubre la hipoteca.`,
            link: '/finanzas/simulador',
            linkText: 'Ver Detalles',
          });
        } else {
          alerts.push({
            id: 'financial-risk',
            type: 'error',
            title: 'Riesgo Financiero Detectado',
            message: `El saldo final proyectado es negativo (€${balance.toLocaleString()}). Tu hipoteca podría no estar cubierta.`,
            link: '/finanzas/simulador',
            linkText: 'Revisar Simulador',
          });
        }
      }
    } catch (error) {
      console.error('Error reading financial status:', error);
    }
  }

  // 3. Portfolio Master Logic - Only show if user has access to Finanzas
  if (canAccessModule(user || null, MODULES.FINANZAS)) {
    try {
      // Solo intentar fetch si hay URL de API configurada (desarrollo local)
      const portfolioApiUrl = process.env.PORTFOLIO_API_URL;
      if (!portfolioApiUrl) {
        // En producción sin backend de portfolio, no mostrar alertas
        console.log('[PortfolioMaster] No PORTFOLIO_API_URL configured, skipping...');
      } else {
        const statusRes = await fetch(`${portfolioApiUrl}/api/portfolio/status`, { cache: 'no-store' });

        if (statusRes.ok) {
          const status = await statusRes.json();

          if (status.current_value > 0) {
            alerts.push({
              id: 'portfolio-master-alert',
              type: status.change_percent >= 0 ? 'success' : 'warning',
              title: 'Portfolio Master',
              message: `Tu patrimonio es de €${status.current_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}.`,
              link: '/finanzas/portfolio',
              linkText: 'Ver Cartera',
              chartData: status.history || [],
              trend: status.change_percent
            });
          }
        } else {
          console.warn(`[PortfolioMaster] Fetch returned status ${statusRes.status}: ${statusRes.statusText}`);
        }
      }
    } catch (error) {
      console.error('[PortfolioMaster] Error fetching Portfolio Master data:', error);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard general</h1>
      </div>

      {/* Alerts Section */}
      <AlertsSection alerts={alerts} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">




        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${category.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-indigo-300"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${category.color}20`, color: category.color || '#6366f1' }}
              >
                {/* Icon placeholder logic could go here, relying on Lucide map or just generic */}
                <div className="h-5 w-5 rounded-full border-2 border-current" />
              </div>
              <span className={clsx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                category._count.items > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              )}>
                {category._count.items} pendientes
              </span>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-indigo-600">
              {category.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {category.description}
            </p>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="block text-sm font-semibold text-gray-900">No categories found</span>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Actividad Reciente</h2>
          <Link href="/all-tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
            Ver todo <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {item.status === 'DONE' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : item.status === 'IN_PROGRESS' ? (
                    <Clock className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.category.name} • {item.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                  <span className="text-xs font-medium text-gray-600">{item.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No hay actividad reciente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
