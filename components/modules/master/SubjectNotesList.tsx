'use client'

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Image as ImageIcon, Trash2, Edit2, Check, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { createSubjectNote, updateSubjectNote, deleteSubjectNote } from "@/lib/actions/master-subjects"
import { toast } from "sonner"

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

    // New Note State
    const [newNoteContent, setNewNoteContent] = useState("")
    const [newNoteDate, setNewNoteDate] = useState<Date>(new Date())
    const [newImageUrl, setNewImageUrl] = useState("")
    const [newImageUrls, setNewImageUrls] = useState<string[]>([])

    // Editing State
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState("")
    const [editDate, setEditDate] = useState<Date>(new Date())

    async function handleCreate() {
        if (!newNoteContent.trim()) return

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
        }
    }

    async function handleUpdate(noteId: string) {
        if (!editContent.trim()) return

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
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Textarea
                                placeholder="Escribe tu nota aquí..."
                                value={newNoteContent}
                                onChange={e => setNewNoteContent(e.target.value)}
                                className="min-h-[100px] bg-white"
                            />
                        </div>
                        <div className="w-48 space-y-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-white">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newNoteDate ? format(newNoteDate, "P", { locale: es }) : <span>Fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={newNoteDate} onSelect={(d) => d && setNewNoteDate(d)} initialFocus />
                                </PopoverContent>
                            </Popover>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="URL imagen..."
                                    value={newImageUrl}
                                    onChange={e => setNewImageUrl(e.target.value)}
                                    className="bg-white text-xs h-9"
                                />
                                <Button size="icon" variant="outline" onClick={addImageUrl} className="shrink-0 h-9 w-9 bg-white">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {newImageUrls.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {newImageUrls.map((url, i) => (
                                <div key={i} className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden border border-slate-200 group">
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

                    <div className="flex justify-end">
                        <Button onClick={handleCreate} disabled={!newNoteContent.trim()}>Guardar Nota</Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {legacyNotes && notes.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <strong>Nota Antigua Recuperada:</strong>
                        <p className="mt-1 whitespace-pre-wrap">{legacyNotes}</p>
                    </div>
                )}

                {notes.map(note => (
                    <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
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
                                <Textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>Cancelar</Button>
                                    <Button size="sm" onClick={() => handleUpdate(note.id)}>Guardar Cambios</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>{format(new Date(note.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
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

                                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                                    {note.content}
                                </div>

                                {note.images.length > 0 && (
                                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                        {note.images.map(img => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                key={img.id}
                                                src={img.url}
                                                alt="Adjunto"
                                                className="h-32 w-auto rounded-lg border border-slate-100 shadow-sm"
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {notes.length === 0 && !legacyNotes && (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No hay notas registradas</p>
                    </div>
                )}
            </div>
        </div>
    )
}
