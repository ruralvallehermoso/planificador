import { getFpEvaluations } from "@/lib/actions/fp-evaluations"
import { EvaluationsList } from "@/components/modules/evaluations/EvaluationsList"

export const dynamic = 'force-dynamic'

export default async function EvaluationsPage() {
    const evaluations = await getFpEvaluations()

    return <EvaluationsList evaluations={evaluations} />
}
