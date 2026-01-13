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
                <div className="flex flex-col items-center justify-center gap-0 mb-4 text-center w-full">
                    {header.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={header.logoUrl} alt="Logo" className="max-h-20 w-auto max-w-full object-contain" />
                    )}

                    <div className="flex flex-wrap items-baseline justify-center gap-x-1 -mt-2 w-full px-1">
                        <h1 className={cn("text-lg uppercase leading-none", isBoldTitle && "font-bold")}>
                            {header.subject}
                        </h1>
                        <span className="text-base text-gray-600 whitespace-nowrap">
                            {header.course} - {header.cycle}
                        </span>
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

                <div className="mt-6 flex flex-col gap-2">
                    <div className="flex items-end gap-2">
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Nombre y Apellidos:</span>
                        <div className="border-b border-gray-400 w-full mb-1"></div>
                    </div>
                </div>

                <div className="mt-4 flex gap-4 overflow-x-auto">
                    {header.raEvaluated.length > 0 ? (
                        header.raEvaluated.map((ra) => (
                            <div key={ra} className="border border-gray-400 p-2 min-w-[100px] text-center">
                                <span className="text-xs font-semibold block text-gray-500">{ra}</span>
                                <span className="text-sm">Calificación</span>
                            </div>
                        ))
                    ) : (
                        <div className="border border-gray-400 p-2 min-w-[120px] text-center">
                            <span className="text-sm font-semibold text-gray-500">Calificación</span>
                        </div>
                    )}
                </div>

                {header.description && (
                    <div className="mt-6 text-sm italic text-gray-600 border-l-4 border-gray-300 pl-3 whitespace-pre-wrap">
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
                            <div className="pl-4 font-mono text-sm leading-relaxed">
                                {formatTestQuestions(section.questions || '', formatting.questionsBold ?? true)}
                            </div>
                        )}

                        {section.type === 'DEVELOP' && (
                            <div className={cn("whitespace-pre-wrap pl-4", formatting.questionsBold && "font-bold")}>
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

function formatTestQuestions(text: string, boldQuestions: boolean) {
    if (!boldQuestions) return <div className="whitespace-pre-wrap">{text}</div>

    return text.split('\n').map((line, i) => {
        // Simple heuristic: If line starts with a number (e.g., "1.", "10)"), it's a question -> Bold
        // If it starts with a letter like "a)", "a.", "- ", it's an answer -> Normal
        const isQuestion = /^\d+[\.\)]/.test(line.trim())
        if (isQuestion) {
            return <div key={i} className="font-bold mt-2">{line}</div>
        }
        return <div key={i} className="font-normal ml-4">{line}</div>
    })
}
