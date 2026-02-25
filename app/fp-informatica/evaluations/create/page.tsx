import { EvaluationForm } from "@/components/modules/evaluations/EvaluationForm"
import { getFpEvaluationById } from "@/lib/actions/fp-evaluations"

interface PageProps {
    searchParams: Promise<{ id?: string }>
}

export default async function CreateEvaluationPage({ searchParams }: PageProps) {
    const params = await searchParams
    const id = params.id

    let initialData = null
    if (id) {
        initialData = await getFpEvaluationById(id)
    }

    return (
        <div className="py-6">
            <EvaluationForm initialData={initialData} />
        </div>
    )
}
