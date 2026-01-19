'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Upload, Trash2, Link as LinkIcon, Save, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading2, Globe } from 'lucide-react'
import { createProject, updateProject, addProjectLink, deleteProjectLink } from '@/lib/actions/projects'
import { toast } from 'sonner'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

interface ProjectFormProps {
    project?: any
    categorySlug: string
    onClose: () => void
}

export function ProjectForm({ project, categorySlug, onClose }: ProjectFormProps) {
    const isEditing = !!project
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState<'content' | 'links'>('content')

    // Local state for immediate UI updates
    const [links, setLinks] = useState<any[]>(project?.links || [])

    // Tiptap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-500 hover:underline cursor-pointer' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'rounded-lg max-h-96 object-contain' },
                allowBase64: true,
            })
        ],
        content: project?.description || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
            },
            handlePaste: (view, event, slice) => {
                const items = Array.from(event.clipboardData?.items || [])
                const imageItem = items.find(item => item.type.startsWith('image/'))

                if (imageItem) {
                    event.preventDefault()
                    const file = imageItem.getAsFile()
                    if (!file) return true

                    // Use Base64 with resizing to avoid payload issues
                    const reader = new FileReader()
                    reader.onload = (readerEvent) => {
                        const img = new window.Image()
                        img.onload = () => {
                            const canvas = document.createElement('canvas')
                            const MAX_WIDTH = 800
                            const MAX_HEIGHT = 800
                            let width = img.width
                            let height = img.height

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width
                                    width = MAX_WIDTH
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height
                                    height = MAX_HEIGHT
                                }
                            }
                            canvas.width = width
                            canvas.height = height
                            const ctx = canvas.getContext('2d')
                            ctx?.drawImage(img, 0, 0, width, height)
                            // Convert to WebP for better compression
                            const dataUrl = canvas.toDataURL('image/webp', 0.8)

                            const { schema } = view.state
                            const node = schema.nodes.image.create({ src: dataUrl })
                            const transaction = view.state.tr.insert(view.state.selection.from, node)
                            view.dispatch(transaction)
                            toast.success("Imagen procesada y añadida")
                        }
                        img.src = readerEvent.target?.result as string
                    }
                    reader.readAsDataURL(file)

                    return true // Handled
                }
                return false
            }
        },
    })

    // Sync content when project changes
    useEffect(() => {
        if (editor && project) {
            // Only update if editor is empty or we are switching projects (though usually remounts)
            // Ideally check if content differs, but for now just rely on initial content.
            // Actually, since we unmount, this might not be needed, but safe to add if we reuse component.
            if (editor.isEmpty && project.description) {
                editor.commands.setContent(project.description)
            }
        }
    }, [project, editor])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('categorySlug', categorySlug)

        // Get content from editor
        const html = editor?.getHTML() || ''
        formData.set('description', html)

        let result
        if (isEditing) {
            result = await updateProject(project.id, formData)
        } else {
            result = await createProject(formData)
        }

        setLoading(false)
        if (result?.success) {
            onClose()
        }
    }

    // ... (keep handleImageUpload, handleDeleteImage, handleAddLink, handleDeleteLink same as before)


    async function handleAddLink(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        const formData = new FormData(form)
        formData.append('projectId', project.id)
        formData.append('categorySlug', categorySlug)

        const res = await addProjectLink(formData)
        if (res.success && res.data) {
            setLinks([...links, res.data])
            toast.success("Enlace añadido")
            form.reset()
        }
    }

    async function handleDeleteLink(linkId: string) {
        if (!confirm('¿Eliminar este enlace?')) return
        const res = await deleteProjectLink(linkId, categorySlug)
        if (res.success) {
            setLinks(links.filter(l => l.id !== linkId))
            toast.success("Enlace eliminado")
        }
    }

    // Floating Menu Component
    const MenuBar = () => {
        if (!editor) return null

        return (
            <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 sticky top-0 z-10">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="Bold"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="Italic"><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="H2"><Heading2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="Bullet List"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="Ordered List"><ListOrdered className="w-4 h-4" /></button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8 flex flex-col h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">
                        {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h3>
                    <button onClick={onClose}><X className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* Tabs Header */}
                <div className="flex border-b px-6 shrink-0">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Contenido Principal
                    </button>
                    <button
                        onClick={() => setActiveTab('links')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'links' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        disabled={!isEditing}
                    >
                        Documentación y Enlaces {(!isEditing) && '(Guardar primero)'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <form id="mainForm" action={handleSubmit} className={`space-y-6 ${activeTab === 'content' ? '' : 'hidden'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título del Proyecto</label>
                                    <input
                                        name="title"
                                        defaultValue={project?.title}
                                        required
                                        placeholder="Ej: Sistema de Gestión de Inventario"
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-lg font-medium focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Portada (Para la Card)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64 = reader.result as string;
                                                        // We put this in a hidden input or state
                                                        const input = document.getElementById('coverImageInput') as HTMLInputElement;
                                                        if (input) input.value = base64;
                                                        // Preview?
                                                        const preview = document.getElementById('coverPreview') as HTMLImageElement;
                                                        if (preview) preview.src = base64;
                                                        // Ensure preview is visible
                                                        if (preview) preview.style.display = 'block';
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    <input type="hidden" name="coverImage" id="coverImageInput" defaultValue={project?.coverImage} />
                                    <img
                                        id="coverPreview"
                                        src={project?.coverImage}
                                        className="mt-2 h-20 w-auto rounded border"
                                        alt=""
                                        style={{ display: project?.coverImage ? 'block' : 'none' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías (Separadas por comas)</label>
                                <input
                                    name="technologies"
                                    defaultValue={project?.technologies}
                                    placeholder="React, Java, Spring Boot..."
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-[500px]">
                            <MenuBar />
                            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>

                    <div className={activeTab === 'links' && isEditing ? '' : 'hidden'}>
                        <div className="space-y-8">
                            {/* Additional Links */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Enlaces de Documentación (Drive, Docs, Repos)
                                </h4>
                                <div className="grid gap-2">
                                    {links.map((link: any) => (
                                        <div key={link.id} className="flex items-center justify-between bg-white p-3 rounded-md border hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-indigo-50 rounded text-indigo-600 shrink-0"><LinkIcon className="w-4 h-4" /></div>
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium truncate">
                                                    {link.title || link.url}
                                                </a>
                                            </div>
                                            <button onClick={() => handleDeleteLink(link.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleAddLink} className="flex gap-2">
                                    <input name="title" placeholder="Título (opcional)" className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                    <input name="url" placeholder="https://..." required className="flex-[2] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                    <button type="submit" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Añadir</button>
                                </form>
                            </div>
                        </div>
                    </div>


                </div>

                <div className="p-6 border-t bg-white flex justify-end space-x-3 shrink-0 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cerrar</button>
                    {activeTab === 'content' && (
                        <button type="submit" form="mainForm" disabled={loading} className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Proyecto')}
                        </button>
                    )}
                </div>
            </div>
        </div >
    )
}
