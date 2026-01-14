'use client'

import { useState } from 'react'
import { Plus, X, Upload, Trash2, Link as LinkIcon, Save } from 'lucide-react'
import { createProject, updateProject, uploadProjectImage, deleteProjectImage, addProjectLink, deleteProjectLink } from '@/lib/actions/projects'

interface ProjectFormProps {
    project?: any
    categorySlug: string
    onClose: () => void
}

export function ProjectForm({ project, categorySlug, onClose }: ProjectFormProps) {
    const isEditing = !!project
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('categorySlug', categorySlug)

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

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0] || !isEditing) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])
        formData.append('projectId', project.id)
        formData.append('categorySlug', categorySlug)

        await uploadProjectImage(formData)
        setUploading(false)
    }

    async function handleDeleteImage(imageId: string) {
        if (!confirm('¿Estás seguro de querer eliminar esta imagen?')) return
        await deleteProjectImage(imageId, categorySlug)
    }

    async function handleAddLink(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.append('projectId', project.id)
        formData.append('categorySlug', categorySlug)

        await addProjectLink(formData)
        e.currentTarget.reset()
    }

    async function handleDeleteLink(linkId: string) {
        if (!confirm('¿Eliminar este enlace?')) return
        await deleteProjectLink(linkId, categorySlug)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">
                        {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h3>
                    <button onClick={onClose}><X className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="mainForm" action={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Título</label>
                            <input
                                name="title"
                                defaultValue={project?.title}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea
                                name="description"
                                rows={4}
                                defaultValue={project?.description}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </form>

                    {isEditing && (
                        <div className="mt-8 space-y-8">
                            {/* Images Section */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> Imágenes
                                </h4>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                    {project.images?.map((img: any) => (
                                        <div key={img.id} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors aspect-video text-gray-500 hover:text-indigo-600">
                                        {uploading ? (
                                            <span className="text-xs">Subiendo...</span>
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 mb-1" />
                                                <span className="text-xs">Añadir</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Links Section */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Enlaces y Drive
                                </h4>

                                <div className="space-y-2 mb-4">
                                    {project.links?.map((link: any) => (
                                        <div key={link.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm truncate flex-1">
                                                {link.title || link.url}
                                            </a>
                                            <button
                                                onClick={() => handleDeleteLink(link.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleAddLink} className="flex gap-2">
                                    <input
                                        name="title"
                                        placeholder="Título (opcional)"
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                                    />
                                    <input
                                        name="url"
                                        placeholder="URL (Drive, Docs...)"
                                        required
                                        className="flex-[2] rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                                    >
                                        Añadir
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        {isEditing ? 'Cerrar' : 'Cancelar'}
                    </button>
                    <button
                        type="submit"
                        form="mainForm"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <span className="animate-spin">⏳</span>}
                        {isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
                    </button>
                </div>
            </div>
        </div>
    )
}
