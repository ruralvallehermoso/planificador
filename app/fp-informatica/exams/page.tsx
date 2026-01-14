import { ExamsList } from "@/components/modules/exams/ExamsList"
import { getExamTemplates } from "@/lib/actions/exams"

export default async function ExamsPage() {
    const templates = await getExamTemplates()

    return <ExamsList templates={templates} />
}
