"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import mammoth from "mammoth"
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Configure worker for react-pdf — must match the version bundled by react-pdf
if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

interface ResourceViewerProps {
    url: string
    type: string // "pdf" | "docx"
    onClose: () => void
    onAddContent: (text: string, mode: "TEST" | "STANDARD") => void
}

type ToastState = {
    visible: boolean
    success: boolean
    message: string
}

export function ResourceViewer({ url, type, onClose, onAddContent }: ResourceViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [docxHtml, setDocxHtml] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const proxyUrl = `/api/upload/resource/proxy?url=${encodeURIComponent(url)}`

    // Selection popup state
    const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null)

    // Adding content state (loading + feedback toast)
    const [isAdding, setIsAdding] = useState(false)
    const [toast, setToast] = useState<ToastState>({ visible: false, success: false, message: "" })

    useEffect(() => {
        if (type === "docx") {
            loadDocx()
        }
    }, [url, type])

    // Auto-hide toast after 3s
    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast.visible])

    const loadDocx = async () => {
        setLoading(true)
        setErrorMsg(null)
        try {
            const res = await fetch(proxyUrl)
            if (!res.ok) throw new Error("Error fetching document")
            const arrayBuffer = await res.arrayBuffer()
            const result = await mammoth.convertToHtml({ arrayBuffer })
            setDocxHtml(result.value || "<p><i>El documento no contiene texto o está vacío.</i></p>")
        } catch (error) {
            console.error("Error loading DOCX:", error)
            setErrorMsg("No se pudo cargar el documento DOCX.")
        } finally {
            setLoading(false)
        }
    }

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setLoading(false)
    }

    const handleMouseUp = useCallback(() => {
        setTimeout(() => {
            const sel = window.getSelection()
            if (sel && sel.toString().trim().length > 0) {
                const range = sel.getRangeAt(0)
                const rect = range.getBoundingClientRect()

                const containerRect = containerRef.current?.getBoundingClientRect()
                if (!containerRect) return

                setSelection({
                    text: sel.toString().trim(),
                    x: rect.left - containerRect.left + (rect.width / 2),
                    y: rect.top - containerRect.top - 10 + (containerRef.current?.scrollTop || 0)
                })
            } else {
                setSelection(null)
            }
        }, 50) // Slightly longer delay to ensure PDF text layer selection completes
    }, [])

    const handleAdd = async (mode: "TEST" | "STANDARD") => {
        if (!selection) return
        setIsAdding(true)

        try {
            onAddContent(selection.text, mode)
            window.getSelection()?.removeAllRanges()
            setSelection(null)

            const label = mode === "TEST" ? "Test" : "Desarrollo"
            setToast({ visible: true, success: true, message: `Añadido a ${label} correctamente` })
        } catch (err) {
            console.error("Error adding from resource:", err)
            setToast({ visible: true, success: false, message: "Error al añadir el contenido" })
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <div className="relative flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 p-3 border-b bg-slate-50 sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0 h-8">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div className="text-sm font-medium text-slate-700 flex-1 truncate">
                    Visor de {type.toUpperCase()}
                </div>
            </div>

            {/* Toast notification — fixed position for guaranteed visibility */}
            {toast.visible && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                    toast.success
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-400/30"
                        : "bg-red-600 text-white ring-2 ring-red-400/30"
                }`}>
                    {toast.success
                        ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                        : <XCircle className="h-5 w-5 shrink-0" />
                    }
                    {toast.message}
                </div>
            )}

            <div
                ref={containerRef}
                className="flex-1 overflow-auto p-4 relative"
                onMouseUp={handleMouseUp}
            >
                {loading && type !== 'pdf' && (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                )}

                {errorMsg && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <XCircle className="h-10 w-10 text-red-300" />
                        <p className="text-red-500 text-sm">{errorMsg}</p>
                        <Button variant="outline" size="sm" onClick={() => { setErrorMsg(null); setLoading(true); if (type === "docx") loadDocx() }}>
                            Reintentar
                        </Button>
                    </div>
                )}

                {type === "pdf" && !errorMsg && (
                    <div className="flex flex-col items-center">
                        <Document
                            file={proxyUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(err) => {
                                console.error("PDF load error:", err)
                                setErrorMsg("Error cargando el PDF. Puede que el archivo esté corrupto o no sea accesible.")
                                setLoading(false)
                            }}
                            loading={<div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}
                            className="flex flex-col gap-4"
                        >
                            {Array.from(new Array(numPages), (_, index) => (
                                <div key={`page_${index + 1}`} className="shadow-md rounded-sm overflow-hidden bg-white border">
                                    <Page
                                        pageNumber={index + 1}
                                        width={Math.min(800, (typeof window !== 'undefined' ? window.innerWidth : 900) - 100)}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={true}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                )}

                {type === "docx" && docxHtml && (
                    <div
                        className="prose prose-sm max-w-none prose-slate bg-white p-8 shadow-sm rounded-sm border min-h-full"
                        dangerouslySetInnerHTML={{ __html: docxHtml }}
                    />
                )}

                {/* Popover Tooltip for text selection */}
                {selection && (
                    <div
                        className="absolute z-50 bg-slate-800 text-white shadow-xl rounded-lg flex flex-col overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            left: Math.max(10, Math.min(selection.x - 75, (containerRef.current?.clientWidth || 300) - 170)),
                            top: Math.max(10, selection.y - 80)
                        }}
                    >
                        <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-700 text-xs font-semibold text-slate-300">
                            ¿Añadir selección?
                        </div>
                        <button
                            className="px-4 py-2 hover:bg-blue-600 text-left transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                            onClick={() => handleAdd("TEST")}
                            disabled={isAdding}
                        >
                            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Añadir a <b>Test</b>
                        </button>
                        <button
                            className="px-4 py-2 hover:bg-emerald-600 text-left transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                            onClick={() => handleAdd("STANDARD")}
                            disabled={isAdding}
                        >
                            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Añadir a <b>Desarrollo</b>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
