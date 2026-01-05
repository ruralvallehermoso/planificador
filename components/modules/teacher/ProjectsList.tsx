'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createProject, uploadProjectImage } from '@/lib/actions/projects'
import { ProjectCard } from '@/components/modules/teacher/ProjectCard'

export function ProjectsList({ initialProjects, categorySlug }: { initialProjects: any[], categorySlug: string }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [uploadProjectId, setUploadProjectId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    async function handleCreate(formData: FormData) {
        formData.append('categorySlug', categorySlug)
        await createProject(formData)
        setIsCreateOpen(false)
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0] || !uploadProjectId) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])
        formData.append('projectId', uploadProjectId)
        formData.append('categorySlug', categorySlug)

        await uploadProjectImage(formData)
        setUploading(false)
        setUploadProjectId(null)
    }

    return (
        <div>
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-8">
                <p className="text-gray-500">Gestiona los proyectos de clase, documenta el progreso y añade evidencias visuales.</p>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proyecto
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialProjects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onUploadImage={(id) => setUploadProjectId(id)}
                    />
                ))}
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Nuevo Proyecto</h3>
                            <button onClick={() => setIsCreateOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        <form action={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                <input name="title" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Crear Proyecto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Hidden File Input for Upload */}
            {uploadProjectId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl text-center">
                        <h3 className="text-lg font-medium mb-4">Subir Imagen</h3>
                        {uploading ? (
                            <p className="text-indigo-600">Subiendo...</p>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <button onClick={() => setUploadProjectId(null)} className="mt-4 text-sm text-gray-500 underline">Cancelar</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
