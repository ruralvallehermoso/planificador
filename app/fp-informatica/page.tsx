import { prisma } from "@/lib/prisma"
import { TeacherCalendar } from "@/components/modules/teacher/TeacherCalendar"
import { Plus } from "lucide-react"
import Link from "next/link"
import { SidebarTaskManager } from "@/components/modules/teacher/SidebarTaskManager"

export default async function FPModulePage() {
    const categorySlug = 'fp-informatica'

    // Fetch category to get ID
    const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: {
            items: {
                // where: { status: { not: 'DONE' } }, // Show all for now to let user toggle? Or just active. User asked to "modify status", so maybe valid to show all or just pending. I'll show ACTIVE for now as per design, but switching to 'take 5' most recent might be better.
                // Actually for a todo list, usually you see what's pending.
                // I'll keep the filter loosely but maybe increase limit?
                take: 100,
                orderBy: { createdAt: 'desc' }
            },
            sections: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!category) return <div>Category not found. Please seed database.</div>

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Main Calendar Area (Left) */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                    <div className="flex space-x-3">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Clase
                        </button>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <TeacherCalendar categoryId={category.id} />
                </div>
            </div>

            {/* Quick Tasks / Projects Sidebar (Right) */}
            <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-1">
                {/* Quick Tasks Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Tareas Pendientes</h3>
                        <button className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">Ver todas</button>
                    </div>
                    <SidebarTaskManager
                        tasks={category.items || []}
                        sections={category.sections || []}
                        categoryId={category.id}
                        categorySlug={categorySlug}
                    />
                </div>

                {/* Projects Link Panel */}
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <h3 className="font-semibold text-indigo-900 mb-2">Proyectos</h3>
                    <p className="text-sm text-indigo-700 mb-4">Gestiona los proyectos de tus alumnos y documentación.</p>
                    <Link href="/fp-informatica/projects" className="block w-full text-center py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Ir a Proyectos
                    </Link>
                </div>
            </div>
        </div>
    )
}
