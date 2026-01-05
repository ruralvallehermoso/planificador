import { prisma } from "@/lib/prisma"
import { getProjects } from "@/lib/actions/projects"
import { ProjectsList } from "@/components/modules/teacher/ProjectsList"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ProjectsPage() {
    const categorySlug = 'fp-informatica'
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })

    if (!category) return <div>Category not found</div>

    const projects = await getProjects(category.id)

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href={`/${categorySlug}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
                    <p className="text-sm text-gray-500">FP Informática</p>
                </div>
            </div>

            <ProjectsList initialProjects={projects} categorySlug={categorySlug} />
        </div>
    )
}
