import { SubjectBuilder } from "@/components/modules/fp/SubjectBuilder"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
            topics: { orderBy: { order: 'asc' } },
            practices: { orderBy: { order: 'asc' } }
        }
    })

    if (!subject) {
        notFound()
    }

    // Cast Prisma types to SubjectBuilder expected types
    const formattedSubject = {
        ...subject,
        topics: subject.topics.map(t => ({
            id: t.id,
            title: t.title,
            materialLink: t.materialLink || ''
        })),
        practices: subject.practices.map(p => ({
            id: p.id,
            title: p.title,
            deliveryDate: p.deliveryDate ? p.deliveryDate.toISOString() : '',
            statementLink: p.statementLink || '',
            deliveryFolderLink: p.deliveryFolderLink || ''
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/fp-informatica/subjects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Editar Asignatura</h1>
                    <p className="text-sm text-gray-500">Modifica la estructura y contenidos</p>
                </div>
            </div>

            <SubjectBuilder initialData={formattedSubject} />
        </div>
    )
}
