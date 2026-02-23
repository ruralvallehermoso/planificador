import { Suspense } from 'react'
import { FinanzasTasksClient } from '@/components/modules/finanzas/tasks/FinanzasTasksClient'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { canAccessModule } from '@/lib/auth/permissions'
import { MODULES } from '@/lib/auth/config'
import { Target } from 'lucide-react'

export default async function FinanzasTareasPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    if (session.user.role !== 'ADMIN' && !canAccessModule(session.user, MODULES.FINANZAS)) {
        redirect('/unauthorized')
    }

    return (
        <div className="flex-1 space-y-6 md:p-8 p-4 pt-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-blue-200/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <Target className="w-7 h-7 text-blue-700 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                            Tareas Financieras
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Gestión de objetivos y tareas pendientes de finanzas.
                        </p>
                    </div>
                </div>
            </div>

            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                <FinanzasTasksClient />
            </Suspense>
        </div>
    )
}
