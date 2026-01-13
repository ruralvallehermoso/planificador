import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

export default function ClassesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/fp-informatica" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clases</h1>
                    <p className="text-sm text-gray-500">FP Informática</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo de Clases en Desarrollo</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Próximamente podrás gestionar el horario de clases, materiales y asistencia desde esta sección.
                </p>
                <div className="mt-6">
                    <Link href="/fp-informatica" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
