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
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 25mm 15mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                
                /* Global Table Styles for Exam Preview */
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 1rem;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #2563eb;
                    color: white;
                    font-weight: bold;
                }
                p {
                    margin-bottom: 0.75em;
                }
            `}</style>
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-8">
                <div className="flex flex-col items-center justify-center gap-4 mb-4 text-center w-full">
                    {header.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={header.logoUrl} alt="Logo" className="max-h-[3cm] w-auto max-w-full object-contain block" />
                    )}

                    <div className="flex flex-row flex-nowrap items-baseline justify-center gap-x-2 w-full">
                        <h1 className={cn("text-lg uppercase leading-none whitespace-nowrap", isBoldTitle && "font-bold")}>
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
                    {header.part1Percentage && (
                        <div className="flex gap-2 text-gray-600">
                            <span className="font-semibold">Parte 1 (Test):</span>
                            <span>{header.part1Percentage}</span>
                        </div>
                    )}
                    {header.part2Percentage && (
                        <div className="flex gap-2 text-gray-600">
                            <span className="font-semibold">Parte 2 (Desarrollo):</span>
                            <span>{header.part2Percentage}</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                    <div className="flex items-end gap-2">
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Nombre y Apellidos:</span>
                        <div className="border-b border-gray-400 w-full mb-1"></div>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                    {header.raEvaluated.length > 0 ? (
                        header.raEvaluated.map((ra) => (
                            <div key={ra} className="flex gap-2 items-end">
                                <span className="font-bold text-gray-900">{ra}</span>
                                <span>Calificación:</span>
                                <div className="border-b border-gray-400 w-16 mb-1"></div>
                            </div>
                        ))
                    ) : (
                        <div className="flex gap-2 items-end">
                            <span className="font-semibold text-gray-900">Calificación:</span>
                            <div className="border-b border-gray-400 w-16 mb-1"></div>
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
            <div className={cn("space-y-4", paragraphSpacing)}>
                {sections.map((section, idx) => (
                    <div key={section.id} className="">
                        <div className="flex items-baseline justify-between mb-4 break-after-avoid">
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
                            <div className="pl-4">
                                {formatTestQuestions(section.questions || '', formatting.questionsBold ?? true)}
                            </div>
                        )}

                        {section.type === 'DEVELOP' && (
                            <div className="pl-4 prose prose-sm max-w-none">
                                {/* Heuristic: If it looks like HTML, render as HTML. Otherwise use legacy formatter. */}
                                {(section.questions || '').trim().startsWith('<') ? (
                                    <div dangerouslySetInnerHTML={{ __html: processHtmlContent(section.questions || '') }} />
                                ) : (
                                    formatDevelopQuestions(section.questions || '', formatting.questionsBold ?? true)
                                )}
                            </div>
                        )}

                        {section.type === 'STANDARD' && (
                            <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                                {(section.content || '').trim().startsWith('<') ? (
                                    <div dangerouslySetInnerHTML={{ __html: processHtmlContent(section.content || '') }} />
                                ) : (
                                    section.content
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function processHtmlContent(html: string) {
    // Regex to match score patterns like (2 pts), (1.5 puntos), (2pt), etc.
    const scoreRegex = /(\(\s*\d+(?:[.,]\d+)?\s*(?:pts|puntos|ptos|p|punto)\.?\s*\))/gi
    return html.replace(scoreRegex, '<strong>$1</strong>')
}

function formatTestQuestions(text: string, boldQuestions: boolean) {
    if (!boldQuestions) return <div className="whitespace-pre-wrap">{text}</div>

    const lines = text.split('\n')
    const blocks: { question: string | null, options: string[] }[] = []

    let currentBlock: { question: string | null, options: string[] } | null = null

    lines.forEach(line => {
        const trimmed = line.trim()
        if (!trimmed) return // Skip empty lines

        // Heuristic: Starts with number (e.g. "1.", "10)") is a new question
        const isQuestion = /^\d+[\.\)]/.test(trimmed)

        if (isQuestion) {
            if (currentBlock) {
                blocks.push(currentBlock)
            }
            currentBlock = { question: line, options: [] }
        } else {
            // It's an option or continuation
            if (currentBlock) {
                currentBlock.options.push(line)
            } else {
                // Orphaned line before any question? Create a block with just this line or treat as question?
                // Let's treat as a separate block without special styling or attach to previous if possible.
                // For simplicity, just render it as a text block.
                blocks.push({ question: null, options: [line] })
            }
        }
    })

    if (currentBlock) {
        blocks.push(currentBlock)
    }

    return blocks.map((block, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
            {block.question && (
                <div className="font-bold">{block.question}</div>
            )}
            {block.options.map((opt, j) => (
                <div key={j} className="font-normal ml-4">{opt}</div>
            ))}
        </div>
    ))
}

function formatDevelopQuestions(text: string, boldQuestions: boolean) {
    return text.split('\n').filter(line => line.trim().length > 0).map((line, i) => {
        // Regex to match score patterns like (2 pts), (1.5 puntos), (2pt), etc.
        const scoreRegex = /(\(\s*\d+(?:[.,]\d+)?\s*(?:pts|puntos|ptos|p|punto)\.?\s*\))/i
        const parts = line.split(scoreRegex)

        // Only bold the score part, not the container
        const containerClass = "mb-6"

        return (
            <div key={i} className={cn(containerClass, "break-inside-avoid")}>
                {parts.map((part, index) => {
                    if (scoreRegex.test(part)) {
                        return <span key={index} className="font-bold">{part}</span>
                    }
                    return <span key={index}>{part}</span>
                })}
            </div>
        )
    })
}
