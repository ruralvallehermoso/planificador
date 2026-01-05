import { prisma } from "@/lib/prisma"
import { SidebarTaskManager } from "@/components/modules/teacher/SidebarTaskManager"

export default async function TareasPage() {
    const categorySlug = 'casa-rural'

    const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: {
            items: {
                take: 100,
                orderBy: { createdAt: 'desc' }
            },
            sections: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!category) return <div>Categoría no encontrada. Por favor, ejecuta el seed de la base de datos.</div>

    return (
        <div className="h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Lista de Tareas</h2>
                    <span className="text-sm text-gray-500">
                        {(category.items || []).filter((item: any) => item.status !== 'DONE').length} pendientes
                    </span>
                </div>
                <SidebarTaskManager
                    tasks={category.items || []}
                    sections={category.sections || []}
                    categoryId={category.id}
                    categorySlug={categorySlug}
                />
            </div>
        </div>
    )
}
