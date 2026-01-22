import { PracticeFormBuilder } from "@/components/modules/subjects/PracticeFormBuilder"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getSubjectPractice } from "@/app/fp-informatica/subjects/actions"

export default async function EditPracticePage({ params }: { params: Promise<{ id: string, practiceId: string }> }) {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login")
    }

    const { id, practiceId } = await params
    const practice = await getSubjectPractice(practiceId)

    if (!practice) {
        notFound()
    }

    return (
        <div className="container mx-auto py-8">
            <PracticeFormBuilder
                subjectId={id}
                initialData={{
                    id: practice.id,
                    subjectId: practice.subjectId,
                    title: practice.title,
                    date: practice.deliveryDate ? practice.deliveryDate.toISOString() : undefined,
                    objectives: practice.objectives || "",
                    description: practice.description || ""
                }}
            />
        </div>
    )
}
