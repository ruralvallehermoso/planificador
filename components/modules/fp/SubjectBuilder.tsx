'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SortableList } from "@/components/ui/sortable-list"
import { createSubject } from "@/lib/actions/fp-subjects"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Loader2, Plus, Trash2, Save, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Topic {
    id: string
    title: string
    materialLink: string
}

interface Practice {
    id: string
    title: string
    deliveryDate: string
    statementLink: string
    deliveryFolderLink: string
}

export function SubjectBuilder() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [topics, setTopics] = useState<Topic[]>([])
    const [practices, setPractices] = useState<Practice[]>([])

    // Tiptap Editor for Notes
    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[150px]',
            },
        },
    })

    // Topic Handlers
    const addTopic = () => {
        setTopics([...topics, { id: crypto.randomUUID(), title: '', materialLink: '' }])
    }
    const updateTopic = (id: string, field: keyof Topic, value: string) => {
        setTopics(topics.map(t => t.id === id ? { ...t, [field]: value } : t))
    }
    const removeTopic = (id: string) => {
        setTopics(topics.filter(t => t.id !== id))
    }

    // Practice Handlers
    const addPractice = () => {
        setPractices([...practices, {
            id: crypto.randomUUID(),
            title: '',
            deliveryDate: '',
            statementLink: '',
            deliveryFolderLink: ''
        }])
    }
    const updatePractice = (id: string, field: keyof Practice, value: string) => {
        setPractices(practices.map(p => p.id === id ? { ...p, [field]: value } : p))
    }
    const removePractice = (id: string) => {
        setPractices(practices.filter(p => p.id !== id))
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)

        // Append complex data
        formData.append('content', editor?.getHTML() || '')
        formData.append('topics', JSON.stringify(topics))
        formData.append('practices', JSON.stringify(practices))

        const result = await createSubject(formData)

        if (result.error) {
            toast.error(result.error)
            setIsLoading(false)
        } else {
            toast.success('Asignatura creada correctamente')
            router.push('/fp-informatica')
            router.refresh()
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* General Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex items-center gap-2 mb-4 border-b pb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Información General</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Asignatura</Label>
                        <Input id="name" name="name" required placeholder="Ej: Desarrollo Web en Entorno Cliente" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Código</Label>
                        <Input id="code" name="code" placeholder="Ej: DWEC" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="semester">Cuatrimestre</Label>
                        <Input id="semester" name="semester" type="number" min="1" max="2" defaultValue="1" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descripción Corta</Label>
                    <Input id="description" name="description" placeholder="Breve resumen de la asignatura..." />
                </div>
            </div>

            {/* Topics Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Temario y Contenidos</h2>
                    <Button type="button" onClick={addTopic} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Añadir Tema
                    </Button>
                </div>

                <SortableList
                    items={topics}
                    onReorder={setTopics}
                    renderItem={(topic, index) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <Input
                                placeholder="Título del Tema"
                                value={topic.title}
                                onChange={(e) => updateTopic(topic.id, 'title', e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enlace a Drive (Materiales)"
                                    value={topic.materialLink}
                                    onChange={(e) => updateTopic(topic.id, 'materialLink', e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTopic(topic.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                />

                {topics.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        No hay temas añadidos
                    </div>
                )}
            </div>

            {/* Practices Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Prácticas y Entregas</h2>
                    <Button type="button" onClick={addPractice} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Añadir Práctica
                    </Button>
                </div>

                <SortableList
                    items={practices}
                    onReorder={setPractices}
                    renderItem={(practice, index) => (
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex gap-2 items-start">
                                <Input
                                    placeholder="Título de la Práctica"
                                    value={practice.title}
                                    onChange={(e) => updatePractice(practice.id, 'title', e.target.value)}
                                    className="font-medium"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removePractice(practice.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                    type="date"
                                    value={practice.deliveryDate}
                                    onChange={(e) => updatePractice(practice.id, 'deliveryDate', e.target.value)}
                                />
                                <Input
                                    placeholder="Enlace Enunciado (Drive)"
                                    value={practice.statementLink}
                                    onChange={(e) => updatePractice(practice.id, 'statementLink', e.target.value)}
                                />
                                <Input
                                    placeholder="Carpeta de Entrega (Drive)"
                                    value={practice.deliveryFolderLink}
                                    onChange={(e) => updatePractice(practice.id, 'deliveryFolderLink', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                />

                {practices.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        No hay prácticas añadidas
                    </div>
                )}
            </div>

            {/* Rich Text Notes */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-4">Bloc de Notas / Ideas</h2>
                <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[200px]">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10">
                <div className="max-w-5xl mx-auto flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Crear Asignatura
                    </Button>
                </div>
            </div>
        </form>
    )
}
