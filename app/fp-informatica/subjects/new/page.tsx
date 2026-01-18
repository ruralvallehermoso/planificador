import { SubjectBuilder } from "@/components/modules/fp/SubjectBuilder"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewSubjectPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/fp-informatica" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nueva Asignatura</h1>
                    <p className="text-sm text-gray-500">Definir estructura y contenidos</p>
                </div>
            </div>

            <SubjectBuilder />
        </div>
    )
}
