'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { deleteProject } from '@/lib/actions/projects'
import { ProjectCard } from '@/components/modules/teacher/ProjectCard'
import { ProjectForm } from '@/components/modules/teacher/ProjectForm'

export function ProjectsList({ initialProjects, categorySlug }: { initialProjects: any[], categorySlug: string }) {
    const [editingProject, setEditingProject] = useState<any | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    async function handleDelete(projectId: string) {
        if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) return
        await deleteProject(projectId, categorySlug)
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
                        onEdit={() => setEditingProject(project)}
                        onDelete={() => handleDelete(project.id)}
                    />
                ))}
            </div>

            {/* Create/Edit Modal */}
            {(isCreateOpen || editingProject) && (
                <ProjectForm
                    project={editingProject}
                    categorySlug={categorySlug}
                    onClose={() => {
                        setIsCreateOpen(false)
                        setEditingProject(null)
                    }}
                />
            )}
        </div>
    )
}
