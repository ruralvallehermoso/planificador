'use client'

import { useState } from "react"
import {
    BookOpen, Plus, Trash2, FileText, Link2, ImageIcon, Upload,
    Loader2, ExternalLink, Download, X, File
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { createSubjectResource, deleteSubjectResource } from "@/lib/actions/master-subjects"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Resource {
    id: string
    name: string
    type: string
    url: string
    size: number | null
    createdAt: Date
}

interface SubjectResourcesProps {
    subjectId: string
    initialResources: Resource[]
}

const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
    PDF: { icon: FileText, color: "text-red-600", bg: "bg-red-50" },
    DOC: { icon: File, color: "text-blue-600", bg: "bg-blue-50" },
    LINK: { icon: Link2, color: "text-emerald-600", bg: "bg-emerald-50" },
    IMAGE: { icon: ImageIcon, color: "text-purple-600", bg: "bg-purple-50" },
}

function getFileType(file: File): string {
    if (file.type === 'application/pdf') return 'PDF'
    if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOC'
    if (file.type.startsWith('image/')) return 'IMAGE'
    return 'PDF'
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SubjectResources({ subjectId, initialResources = [] }: SubjectResourcesProps) {
    const [resources, setResources] = useState(initialResources)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // Link form
    const [linkName, setLinkName] = useState("")
    const [linkUrl, setLinkUrl] = useState("")

    // Tab state
    const [activeTab, setActiveTab] = useState<'file' | 'link'>('file')

    async function handleFileUpload(file: File) {
        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('subjectId', subjectId)

            const response = await fetch('/api/upload/resource', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                toast.error(error.error || 'Error al subir archivo')
                return
            }

            const { url, name, size } = await response.json()
            const type = getFileType(file)

            const result = await createSubjectResource(subjectId, name, type, url, size)
            if (result.success && result.resource) {
                setResources(prev => [result.resource as Resource, ...prev])
                toast.success(`${name} subido correctamente`)
                setIsDialogOpen(false)
            } else {
                toast.error('Error al guardar recurso')
            }
        } catch (error) {
            console.error(error)
            toast.error('Error inesperado al subir')
        } finally {
            setIsUploading(false)
        }
    }

    async function handleAddLink() {
        if (!linkName.trim() || !linkUrl.trim()) return

        let url = linkUrl.trim()
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url

        try {
            setIsUploading(true)
            const result = await createSubjectResource(subjectId, linkName.trim(), 'LINK', url)
            if (result.success && result.resource) {
                setResources(prev => [result.resource as Resource, ...prev])
                toast.success('Enlace añadido')
                setLinkName("")
                setLinkUrl("")
                setIsDialogOpen(false)
            } else {
                toast.error('Error al guardar enlace')
            }
        } catch (error) {
            console.error(error)
            toast.error('Error inesperado')
        } finally {
            setIsUploading(false)
        }
    }

    async function handleDelete(resourceId: string) {
        if (!confirm('¿Eliminar este recurso?')) return

        try {
            const result = await deleteSubjectResource(resourceId, subjectId)
            if (result.success) {
                setResources(prev => prev.filter(r => r.id !== resourceId))
                toast.success('Recurso eliminado')
            } else {
                toast.error('Error al eliminar')
            }
        } catch (error) {
            console.error(error)
            toast.error('Error inesperado')
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            handleFileUpload(files[0])
        }
    }

    function openResource(resource: Resource) {
        window.open(resource.url, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Recursos
                </h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Añadir Recurso</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Tab switcher */}
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('file')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                        activeTab === 'file'
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Upload className="h-4 w-4" />
                                    Subir Archivo
                                </button>
                                <button
                                    onClick={() => setActiveTab('link')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                        activeTab === 'link'
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Link2 className="h-4 w-4" />
                                    Enlace
                                </button>
                            </div>

                            {activeTab === 'file' ? (
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                                        isDragging
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                    )}
                                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => {
                                        const input = document.createElement('input')
                                        input.type = 'file'
                                        input.accept = '.pdf,.doc,.docx,image/*'
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0]
                                            if (file) handleFileUpload(file)
                                        }
                                        input.click()
                                    }}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                            <p className="text-sm text-slate-600">Subiendo archivo...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="h-8 w-8 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-600">
                                                Arrastra un archivo o haz clic
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                PDF, DOC, DOCX, JPG, PNG, GIF, WebP · Máx 20MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="link-name" className="text-sm">Nombre</Label>
                                        <Input
                                            id="link-name"
                                            placeholder="Ej: Guía de la asignatura"
                                            value={linkName}
                                            onChange={e => setLinkName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="link-url" className="text-sm">URL</Label>
                                        <Input
                                            id="link-url"
                                            placeholder="https://..."
                                            type="url"
                                            value={linkUrl}
                                            onChange={e => setLinkUrl(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleAddLink}
                                        disabled={!linkName.trim() || !linkUrl.trim() || isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Añadir Enlace
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Resources List */}
            {resources.length > 0 ? (
                <div className="space-y-2">
                    {resources.map(resource => {
                        const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.PDF
                        const Icon = config.icon

                        return (
                            <div
                                key={resource.id}
                                className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => openResource(resource)}
                            >
                                <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                                    <Icon className={cn("h-4 w-4", config.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">
                                        {resource.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>{resource.type}</span>
                                        {resource.size && (
                                            <>
                                                <span>·</span>
                                                <span>{formatFileSize(resource.size)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {resource.type === 'LINK' ? (
                                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5 text-slate-400" />
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(resource.id)
                                        }}
                                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div
                    className={cn(
                        "text-center py-6 rounded-lg border border-dashed transition-colors",
                        isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-slate-50"
                    )}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-400">Sin recursos</p>
                    <p className="text-xs text-slate-300 mt-1">
                        Arrastra archivos aquí o usa el botón +
                    </p>
                </div>
            )}
        </div>
    )
}
