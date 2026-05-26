import { getFpExamResources } from "@/lib/actions/fp-exam-resources"
import { ResourcesList } from "@/components/modules/exams/ResourcesList"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function FpRecursosPage() {
    const res = await getFpExamResources()
    const resources = res.success && res.data ? res.data : []

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/fp-informatica" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Recursos FP</h1>
                            <p className="text-sm text-slate-500 hidden sm:block">Gestiona documentos para usarlos en tus exámenes</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ResourcesList resources={resources} />
            </main>
        </div>
    )
}
