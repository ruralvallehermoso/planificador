import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getSubjectTopic } from "@/app/fp-informatica/subjects/actions"
import { EditTopicForm } from "@/components/modules/subjects/EditTopicForm"

export default async function EditTopicPage({ params }: { params: Promise<{ id: string, topicId: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/auth/login")

    const { id, topicId } = await params
    const topic = await getSubjectTopic(topicId)

    if (!topic) notFound()

    return (
        <div className="container mx-auto">
            <EditTopicForm topic={{
                id: topic.id,
                subjectId: topic.subjectId,
                title: topic.title,
                materialLink: topic.materialLink || undefined,
                order: topic.order
            }} />
        </div>
    )
}
