import { ArrowLeft, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function ExamsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/fp-informatica" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exámenes</h1>
                    <p className="text-sm text-gray-500">FP Informática</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo de Exámenes en Desarrollo</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Próximamente podrás registrar fechas de exámenes, calificaciones y objetivos de estudio.
                </p>
                <div className="mt-6">
                    <Link href="/fp-informatica/exams/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 shadow-sm">
                        Crear Nuevo Examen
                    </Link>
                    <Link href="/fp-informatica" className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200">
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
