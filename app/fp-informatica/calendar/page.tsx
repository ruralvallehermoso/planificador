import { prisma } from "@/lib/prisma"
import { TeacherCalendar } from "@/components/modules/teacher/TeacherCalendar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function FPModulePage() {
    const categorySlug = 'fp-informatica'

    // Fetch category to get ID
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

    if (!category) return <div>Category not found. Please seed database.</div>

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Main Calendar Area (Left) */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/fp-informatica" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <TeacherCalendar categoryId={category.id} />
                </div>
            </div>
        </div>
    )
}
