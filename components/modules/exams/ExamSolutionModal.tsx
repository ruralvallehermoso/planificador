"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { Printer, Download, Copy, Check } from "lucide-react"

interface Props {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    solutionHtml: string
    examTitle: string
}

export function ExamSolutionModal({ isOpen, onOpenChange, solutionHtml, examTitle }: Props) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        const text = new DOMParser().parseFromString(solutionHtml, "text/html").body.textContent || ""
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <html>
                <head>
                    <title>Solucionario: ${examTitle}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                        h2 { margin-top: 30px; font-size: 18px; color: #444; border-bottom: 1px solid #eee; }
                        strong { font-weight: bold; color: #000; }
                    </style>
                </head>
                <body>
                    <h1>Solucionario: ${examTitle}</h1>
                    ${solutionHtml}
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    const handleDownloadPdf = () => {
        // Simple HTML-to-blob implementation for now
        // A robust PDF generation might need a library like html2pdf.js or jspdf if "Print" isn't enough.
        // For best usability without heavy libs, we'll suggest using Print -> Save as PDF
        handlePrint()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Solucionario Generado por IA (Gemini)</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden border rounded-md bg-white p-4">
                    <div className="h-full pr-4 overflow-y-auto custom-scrollbar">
                        <div
                            className="prose prose-sm max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: solutionHtml }}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-start lg:justify-end">
                    <Button variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copiar Texto
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir / Guardar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
