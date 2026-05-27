"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, FileImage, Trash2, Loader2, UploadCloud, FileType, Plus } from "lucide-react"
import { deleteFpExamResource } from "@/lib/actions/fp-exam-resources"
import type { FpExamResource } from "@prisma/client"
import { cn } from "@/lib/utils"

interface ResourcesListProps {
    resources: FpExamResource[]
    onSelect?: (resource: FpExamResource) => void
    selectable?: boolean
    compact?: boolean
    onUploadSuccess?: () => void
}

export function ResourcesList({ resources, onSelect, selectable = false, compact = false, onUploadSuccess }: ResourcesListProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("¿Estás seguro de que deseas eliminar este recurso?")) return
        setIsDeleting(id)
        await deleteFpExamResource(id)
        setIsDeleting(null)
        router.refresh()
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || ''
            let type = 'other'
            if (ext === 'pdf') type = 'pdf'
            else if (ext === 'doc' || ext === 'docx') type = 'docx'

            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch(`/api/upload/fp-resource?filename=${encodeURIComponent(file.name)}&type=${type}`, {
                method: "POST",
                body: file
            })

            if (!res.ok) throw new Error("Failed to upload")
            
            router.refresh()
            onUploadSuccess?.()
        } catch (error) {
            console.error(error)
            alert("Error subiendo el archivo")
        } finally {
            setIsUploading(false)
            if (e.target) e.target.value = ''
        }
    }

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
                <h2 className={cn("font-bold text-slate-800", compact ? "text-lg" : "text-2xl")}>Recursos</h2>
                <div>
                    <input
                        type="file"
                        id="resource-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <label htmlFor="resource-upload">
                        <Button asChild variant={compact ? "outline" : "default"} size="sm" className="cursor-pointer" disabled={isUploading}>
                            <span>
                                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (compact ? <Plus className="h-4 w-4 mr-1" /> : <UploadCloud className="h-4 w-4 mr-2" />)}
                                Subir Documento
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            {resources.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-600">No hay recursos</h3>
                    <p className="text-slate-500 text-sm mt-1">Sube documentos PDF o Word para usarlos en tus exámenes.</p>
                </div>
            ) : (
                <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
                    {resources.map((res) => (
                        <div
                            key={res.id}
                            onClick={() => onSelect?.(res)}
                            className={cn(
                                "group relative flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-200",
                                selectable ? "cursor-pointer hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5" : "hover:shadow-md",
                                compact ? "p-3 flex-row items-center gap-3" : "p-5"
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-center rounded-lg bg-slate-50",
                                compact ? "h-12 w-12 shrink-0" : "h-24 w-full mb-4"
                            )}>
                                {res.type === 'pdf' ? (
                                    <FileText className={cn("text-red-500", compact ? "h-6 w-6" : "h-10 w-10")} />
                                ) : (
                                    <FileType className={cn("text-blue-500", compact ? "h-6 w-6" : "h-10 w-10")} />
                                )}
                            </div>
                            
                            <div className={cn("flex flex-col min-w-0", compact ? "flex-1" : "")}>
                                <h4 className="font-semibold text-slate-800 truncate text-sm" title={res.name}>
                                    {res.name}
                                </h4>
                                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                                    <span className="uppercase">{res.type}</span>
                                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur text-slate-400 hover:text-red-600 hover:bg-red-50",
                                    compact ? "right-2 top-1/2 -translate-y-1/2" : "top-2 right-2"
                                )}
                                onClick={(e) => handleDelete(e, res.id)}
                                disabled={isDeleting === res.id}
                            >
                                {isDeleting === res.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
