import { Calendar, BookOpen, FolderOpen, GraduationCap } from "lucide-react"
import Link from "next/link"

const DASHBOARD_CARDS = [
    {
        title: "Calendario",
        description: "Gestiona tu horario, tutorías y entregas importantes.",
        icon: Calendar,
        href: "/fp-informatica/calendar",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        borderColor: "border-purple-200",
        hoverBorder: "hover:border-purple-300",
    },
    {
        title: "Clases",
        description: "Accede a los materiales, apuntes y control de asistencia.",
        icon: BookOpen,
        href: "/fp-informatica/classes",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-200",
        hoverBorder: "hover:border-blue-300",
    },
    {
        title: "Proyectos",
        description: "Supervisa el progreso de los proyectos y documentaciones.",
        icon: FolderOpen,
        href: "/fp-informatica/projects",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        borderColor: "border-indigo-200",
        hoverBorder: "hover:border-indigo-300",
    },
    {
        title: "Exámenes",
        description: "Planifica fechas de evaluaciones y registra calificaciones.",
        icon: GraduationCap,
        href: "/fp-informatica/exams",
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        borderColor: "border-amber-200",
        hoverBorder: "hover:border-amber-300",
    }
]

export default function FPInformaticaDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">FP Informática</h1>
                <p className="mt-2 text-gray-600">Panel de control y gestión académica</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {DASHBOARD_CARDS.map((card) => {
                    const Icon = card.icon
                    return (
                        <Link
                            key={card.title}
                            href={card.href}
                            className={`group relative p-6 bg-white rounded-xl shadow-sm border ${card.borderColor} ${card.hoverBorder} transition-all duration-200 hover:shadow-md hover:-translate-y-1 block`}
                        >
                            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                <Icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                                {card.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {card.description}
                            </p>
                        </Link>
                    )
                })}
            </div>

            {/* Optional: Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No hay actividad reciente
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h2>
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No hay eventos próximos
                    </div>
                </div>
            </div>
        </div>
    )
}
