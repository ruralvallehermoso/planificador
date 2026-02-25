import { ExamsList } from "@/components/modules/exams/ExamsList"
import { getExamTemplates } from "@/lib/actions/exams"

export default async function EvaluationsPage() {
    const templates = await getExamTemplates('EVALUATION')

    return <ExamsList templates={templates} basePath="/fp-informatica/evaluations" type="EVALUATION" />
}
