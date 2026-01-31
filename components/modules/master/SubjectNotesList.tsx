'use client'

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Image as ImageIcon, Trash2, Edit2, Check, X, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { createSubjectNote, updateSubjectNote, deleteSubjectNote } from "@/lib/actions/master-subjects"
import { toast } from "sonner"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface NoteImage {
    id: string
    url: string
}

interface Note {
    id: string
    content: string
    date: Date
    images: NoteImage[]
}

interface SubjectNotesListProps {
    subjectId: string
    initialNotes: Note[]
    legacyNotes?: string | null
}

export function SubjectNotesList({ subjectId, initialNotes = [], legacyNotes }: SubjectNotesListProps) {
    const [notes, setNotes] = useState(initialNotes)
    const [isCreating, setIsCreating] = useState(false)

    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // New Note State
    const [newNoteContent, setNewNoteContent] = useState("")
    const [newNoteDate, setNewNoteDate] = useState<Date>(new Date())
    const [newImageUrl, setNewImageUrl] = useState("")
    const [newImageUrls, setNewImageUrls] = useState<string[]>([])

    // Editing State
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState("")
    const [editDate, setEditDate] = useState<Date>(new Date())

    async function uploadFile(file: File) {
        if (!file.type.startsWith('image/')) return toast.error("Solo se permiten imágenes")

        // 50MB is limit in next.config, but let's be safe with 10MB per image, Base64 adds 33% overhead
        if (file.size > 10 * 1024 * 1024) return toast.error("Imagen demasiado grande (máx 10MB)")

        setIsUploading(true)

        try {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = reader.result as string
                setNewImageUrls(prev => [...prev, base64])
                toast.success("Imagen procesada")
                setIsUploading(false)
            }
            reader.onerror = () => {
                toast.error("Error al leer imagen")
                setIsUploading(false)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error(error)
            setIsUploading(false)
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile()
                if (file) uploadFile(file)
            }
        }
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            uploadFile(files[0])
        }
    }

    async function handleCreate() {
        // Simple check for empty content, handling HTML empty tags
        if (!newNoteContent.replace(/<[^>]*>/g, '').trim() && newImageUrls.length === 0) return

        setIsSaving(true)

        try {
            const result = await createSubjectNote(subjectId, newNoteContent, newNoteDate, newImageUrls)
            if (result.success && result.note) {
                toast.success("Nota añadida")
                setNotes([result.note as any, ...notes]) // Cast simplistic for now
                setNewNoteContent("")
                setNewImageUrls([])
                setIsCreating(false)
            } else {
                toast.error("Error al crear nota")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        } finally {
            setIsSaving(false)
        }
    }

    async function handleUpdate(noteId: string) {
        if (!editContent.replace(/<[^>]*>/g, '').trim()) return
        setIsSaving(true)

        try {
            // For editing, we are not handling image editing in UI yet to keep it simple as implemented in Server Action
            // Passing empty array means basically "don't change images" in our simplified mental model (though server replaces...) 
            // Wait, server replaces! We need to handle images in edit if we want to keep them.
            // Let's simplified: Edit only text/date for now. To fix images we would need to pass existing ones.
            // Since I didn't verify the server action logic deeply (assumed replace), let's re-read:
            // "await prisma.noteImage.deleteMany... createMany". Yes, it deletes all. so we MUST pass all images back.
            // For now, I will NOT support editing images to avoid data loss until UI is ready. I will fetch current images from the note object.

            const currentNote = notes.find(n => n.id === noteId)
            const currentImages = currentNote?.images.map(i => i.url) || []

            const result = await updateSubjectNote(noteId, editContent, editDate, currentImages)
            if (result.success) {
                toast.success("Nota actualizada")
                setNotes(notes.map(n => n.id === noteId ? { ...n, content: editContent, date: editDate } : n))
                setEditingNoteId(null)
            } else {
                toast.error("Error al actualizar")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete(noteId: string) {
        if (!confirm("¿Borrar esta nota?")) return
        try {
            const result = await deleteSubjectNote(noteId, subjectId)
            if (result.success) {
                toast.success("Nota eliminada")
                setNotes(notes.filter(n => n.id !== noteId))
            } else {
                toast.error("Error al eliminar")
            }
        } catch (error) {
            console.error(error)
        }
    }

    const addImageUrl = () => {
        if (newImageUrl.trim()) {
            setNewImageUrls([...newImageUrls, newImageUrl])
            setNewImageUrl("")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Bitácora de Asignatura</h3>
                <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "default"} size="sm">
                    {isCreating ? "Cancelar" : "Nueva Entrada"}
                </Button>
            </div>

            {isCreating && (
                <div
                    className={cn(
                        "bg-slate-50 p-6 rounded-xl border-2 border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2 transition-colors",
                        isDragging && "border-blue-500 bg-blue-50"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            {isDragging && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 z-10 rounded-md backdrop-blur-sm">
                                    <p className="text-blue-600 font-medium">Suelta la imagen allí</p>
                                </div>
                            )}
                            <RichTextEditor
                                placeholder="Escribe tu nota aquí... (Puedes usar formato rico)"
                                value={newNoteContent}
                                onChange={setNewNoteContent}
                                className="min-h-[200px] bg-white"
                            />
                        </div>

                        <div className="flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
                            <div className="flex gap-4 items-center">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal bg-white">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newNoteDate ? format(newNoteDate, "PPP", { locale: es }) : <span>Fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={newNoteDate} onSelect={(d) => d && setNewNoteDate(d)} initialFocus />
                                    </PopoverContent>
                                </Popover>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Pegar URL imagen..."
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                        className="bg-white max-w-[300px]"
                                    />
                                    <Button size="icon" variant="outline" onClick={addImageUrl} className="shrink-0 bg-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button onClick={handleCreate} disabled={!newNoteContent.trim() && newImageUrls.length === 0 || isSaving} className="min-w-[150px]">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? "Guardando..." : "Guardar Nota"}
                            </Button>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {newImageUrls.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 pt-2">
                            {newImageUrls.map((url, i) => (
                                <div key={i} className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 group bg-white shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                    <button
                                        onClick={() => setNewImageUrls(newImageUrls.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-6">
                {legacyNotes && notes.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <strong>Nota Antigua Recuperada:</strong>
                        <p className="mt-1 whitespace-pre-wrap">{legacyNotes}</p>
                    </div>
                )}

                {notes.map(note => (
                    <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors group shadow-sm">
                        {editingNoteId === note.id ? (
                            <div className="space-y-4">
                                <div className="flex gap-2 mb-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">
                                                <CalendarIcon className="mr-2 h-3 w-3" />
                                                {format(editDate, "P", { locale: es })}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={editDate} onSelect={(d) => d && setEditDate(d)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <RichTextEditor
                                    value={editContent}
                                    onChange={setEditContent}
                                    className="min-h-[150px]"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>Cancelar</Button>
                                    <Button size="sm" onClick={() => handleUpdate(note.id)} disabled={isSaving}>
                                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span className="font-medium text-slate-700">{format(new Date(note.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => {
                                            setEditingNoteId(note.id)
                                            setEditContent(note.content)
                                            setEditDate(new Date(note.date))
                                        }}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(note.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: note.content }} />

                                {note.images.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                                        {note.images.map(img => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                key={img.id}
                                                src={img.url}
                                                alt="Adjunto"
                                                className="h-40 w-auto rounded-lg border border-slate-100 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                                                onClick={() => window.open(img.url, '_blank')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {notes.length === 0 && !legacyNotes && (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No hay entradas en la bitácora</p>
                        <p className="text-sm opacity-70">Crea una nueva nota para empezar a registrar el progreso</p>
                    </div>
                )}
            </div>
        </div>
    )
}
