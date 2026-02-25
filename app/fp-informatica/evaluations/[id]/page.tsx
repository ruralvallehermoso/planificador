import { getFpEvaluationById } from "@/lib/actions/fp-evaluations"
import { notFound } from "next/navigation"
import { EvaluationDashboard } from "@/components/modules/evaluations/EvaluationDashboard"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EvaluationDetailPage({ params }: PageProps) {
    const { id } = await params

    const evaluation = await getFpEvaluationById(id)
    if (!evaluation) {
        notFound()
    }

    return (
        <EvaluationDashboard evaluation={evaluation} />
    )
}
