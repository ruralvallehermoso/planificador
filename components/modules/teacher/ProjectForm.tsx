'use client'

import { useState } from 'react'
import { Plus, X, Upload, Trash2, Link as LinkIcon, Save, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading2, Globe } from 'lucide-react'
import { createProject, updateProject, uploadProjectImage, deleteProjectImage, addProjectLink, deleteProjectLink } from '@/lib/actions/projects'
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
    const [activeTab, setActiveTab] = useState<'content' | 'links' | 'media'>('content')

    // Local state for immediate UI updates
    const [links, setLinks] = useState<any[]>(project?.links || [])
    const [images, setImages] = useState<any[]>(project?.images || [])

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

                    // Use Base64 for immediate feedback and to avoid server-side upload issues on Vercel
                    const reader = new FileReader()
                    reader.onload = (readerEvent) => {
                        const base64 = readerEvent.target?.result as string
                        if (base64) {
                            const { schema } = view.state
                            const node = schema.nodes.image.create({ src: base64 })
                            const transaction = view.state.tr.insert(view.state.selection.from, node)
                            view.dispatch(transaction)
                            toast.success("Imagen pegada correctamente")
                        }
                    }
                    reader.readAsDataURL(file)

                    return true // Handled
                }
                return false
            }
        },
    })

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
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0] || !isEditing) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])
        formData.append('projectId', project.id)
        formData.append('categorySlug', categorySlug)

        const res = await uploadProjectImage(formData)

        if (res.success && res.url) {
            // We need the ID to delete it later. The updated action should return it.
            // If we don't have it, we might need to reload or guess. 
            // Ideally we update the action to return the created image object.
            if (res.id) {
                setImages([...images, { id: res.id, url: res.url, projectId: project.id }])
                toast.success("Imagen subida")
            } else {
                setImages([...images, { id: Math.random().toString(), url: res.url, projectId: project.id }]) // Temporary ID fallback
                toast.success("Imagen subida")
            }
        }
        setUploading(false)
    }

    async function handleDeleteImage(imageId: string) {
        if (!confirm('¿Estás seguro de querer eliminar esta imagen?')) return
        const res = await deleteProjectImage(imageId, categorySlug)
        if (res.success) {
            setImages(images.filter(img => img.id !== imageId))
            toast.success("Imagen eliminada")
        }
    }

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
                        Repositorio y Enlaces {(!isEditing) && '(Guardar primero)'}
                    </button>
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'media' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        disabled={!isEditing}
                    >
                        Multimedia {(!isEditing) && '(Guardar primero)'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'content' && (
                        <form id="mainForm" action={handleSubmit} className="space-y-6">
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
                        </form>
                    )}

                    {activeTab === 'links' && isEditing && (
                        <div className="space-y-8">
                            {/* Specific URLs Form */}
                            <form action={handleSubmit} id="urlsForm" className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> URLs Principales
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Repositorio (GitHub/GitLab)</label>
                                        <input
                                            name="repositoryUrl"
                                            defaultValue={project?.repositoryUrl}
                                            placeholder="https://github.com/..."
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Despliegue / Demo</label>
                                        <input
                                            name="deploymentUrl"
                                            defaultValue={project?.deploymentUrl}
                                            placeholder="https://mi-proyecto.vercel.app"
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <input type="hidden" name="title" value={project.title} /> {/* Required for update */}
                                <input type="hidden" name="description" value={editor?.getHTML()} /> {/* Preserve Desc */}
                                <input type="hidden" name="technologies" value={project.technologies} />
                                <div className="flex justify-end">
                                    <button type="submit" form="urlsForm" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Guardar URLs</button>
                                </div>
                            </form>

                            {/* Additional Links */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Recursos Adicionales (Drive, Docs)
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
                                <form onSubmit={handleAddLink} className="flex gap-2 bg-white p-2 rounded-md border">
                                    <input name="title" placeholder="Título (opcional)" className="flex-1 rounded border-0 bg-transparent px-2 ring-0 focus:ring-0 sm:text-sm" />
                                    <div className="w-px bg-gray-200"></div>
                                    <input name="url" placeholder="https://..." required className="flex-[2] rounded border-0 bg-transparent px-2 ring-0 focus:ring-0 sm:text-sm" />
                                    <button type="submit" className="px-3 bg-gray-900 text-white rounded text-sm hover:bg-black">Añadir</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'media' && isEditing && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2"><Upload className="w-4 h-4" /> Galería de Imágenes</h4>
                                <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                                    {uploading ? 'Subiendo...' : 'Subir Nueva Imagen'}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {images.map((img: any) => (
                                    <div key={img.id} className="group relative aspect-video bg-white rounded-lg border shadow-sm overflow-hidden">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                            <button onClick={() => handleDeleteImage(img.id)} className="text-white hover:text-red-300"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-dashed">
                                        No hay imágenes todavía. Sube capturas del proyecto.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
        </div>
    )
}
