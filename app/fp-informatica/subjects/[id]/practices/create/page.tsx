import { PracticeFormBuilder } from "@/components/modules/subjects/PracticeFormBuilder"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CreatePracticePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login")
    }

    const { id } = await params

    return (
        <div className="container mx-auto py-8">
            <PracticeFormBuilder subjectId={id} />
        </div>
    )
}
