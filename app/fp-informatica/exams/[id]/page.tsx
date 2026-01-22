import { prisma } from '@/lib/prisma'
import { getExamGradeReport } from '@/lib/actions/exam-grades'
import { ExamFormBuilder } from "@/components/modules/exams/ExamFormBuilder"
import { GradeTabs } from '@/components/modules/exams/grades/GradeTabs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ExamDetailPage({ params }: { params: { id: string } }) {
    const { id } = params

    // As params is a Promise in Next.js 15+, we need to await it if using types correctly, 
    // but in Page props standard behavior for now:
    // If it's Next 15, we might need await params.
    // Assuming Next 14/15 based on codebase info:

    const exam = await prisma.examTemplate.findUnique({
        where: { id: id }
    })

    if (!exam) {
        notFound()
    }

    const { report } = await getExamGradeReport(id)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/fp-informatica/exams" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
                    <p className="text-sm text-gray-500">{exam.subject || 'Sin Asignatura'} - {exam.course}</p>
                </div>
            </div>

            <Tabs defaultValue="grades" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="design" className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Diseño / Contenido
                    </TabsTrigger>
                    <TabsTrigger value="grades" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Calificaciones
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="design" className="mt-0">
                    <div className="bg-white rounded-xl border p-1">
                        {/* We reuse the builder but verify functionality */}
                        <ExamFormBuilder initialData={exam} />
                    </div>
                </TabsContent>

                <TabsContent value="grades" className="mt-0">
                    <GradeTabs report={report} examId={id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
