import { ExamHeaderData, ExamSection, ExamFormatting } from "@/lib/actions/exams"
import { cn } from "@/lib/utils"

interface Props {
    header: ExamHeaderData
    sections: ExamSection[]
    formatting: ExamFormatting
}

export function ExamPreview({ header, sections, formatting }: Props) {
    const { font, fontSize, isBoldTitle, lineHeight, paragraphSpacing } = formatting

    return (
        <div id="exam-document" className={cn(
            "bg-white p-8 md:p-12 shadow-lg max-w-[210mm] mx-auto min-h-[297mm] print:shadow-none print:w-full print:max-w-none print:mx-0 print:p-0",
            font,
            fontSize,
            lineHeight
        )}>
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                    {header.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={header.logoUrl} alt="Logo" className="h-16 object-contain" />
                    )}
                    <div className="text-right flex-1">
                        <h1 className={cn("text-xl uppercase", isBoldTitle && "font-bold")}>{header.subject}</h1>
                        <p className="text-sm text-gray-600">{header.cycle} - {header.course}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm border p-4 bg-gray-50/50">
                    <div className="flex gap-2">
                        <span className="font-semibold">Evaluación:</span>
                        <span>{header.evaluation}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold">Fecha:</span>
                        <span>{header.date ? new Date(header.date).toLocaleDateString("es-ES") : ''}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold">Duración:</span>
                        <span>{header.duration}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold">RA Evaluados:</span>
                        <span>{header.raEvaluated.join(", ")}</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-8">
                    <div className="border-b border-gray-300 pb-1">
                        <span className="text-sm font-semibold text-gray-500">Apellidos y Nombre:</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1">
                        <span className="text-sm font-semibold text-gray-500">Calificación:</span>
                    </div>
                </div>

                {header.description && (
                    <div className="mt-4 text-sm italic text-gray-600 border-l-4 border-gray-300 pl-3">
                        {header.description}
                    </div>
                )}
            </div>

            {/* Sections */}
            <div className={cn("space-y-8", paragraphSpacing)}>
                {sections.map((section, idx) => (
                    <div key={section.id}>
                        <div className="flex items-baseline justify-between mb-4">
                            <h2 className={cn("text-lg border-b border-gray-200 pb-1 w-full", isBoldTitle && "font-bold")}>
                                {idx + 1}. {section.title}
                            </h2>
                            {section.ra && section.ra.length > 0 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2 whitespace-nowrap">
                                    {section.ra.join(", ")}
                                </span>
                            )}
                        </div>

                        {section.type === 'TEST' && (
                            <div className="whitespace-pre-wrap pl-4 font-mono text-sm leading-relaxed">
                                {section.questions}
                            </div>
                        )}

                        {section.type === 'DEVELOP' && (
                            <div className="whitespace-pre-wrap pl-4">
                                {section.questions}
                            </div>
                        )}

                        {section.type === 'STANDARD' && (
                            <div className="whitespace-pre-wrap">
                                {section.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
