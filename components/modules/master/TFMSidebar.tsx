'use client'

import { useState } from 'react'
import { Edit2, FileText, Plus, Trash2, X, ExternalLink } from 'lucide-react'
import { updateTFMConfig, createTFMResource, deleteTFMResource } from '@/lib/actions/tfm'
import { toast } from 'sonner'

interface TFMConfig {
    id: string
    title: string | null
    tutor: string | null
    tutorInitials: string | null
    researchLine: string | null
    convocatoria: string | null
}

interface TFMResource {
    id: string
    title: string
    url: string | null
    order: number
}

interface TFMSidebarProps {
    config: TFMConfig | null
    resources: TFMResource[]
}

export function TFMSidebar({ config: initialConfig, resources: initialResources }: TFMSidebarProps) {
    const [config, setConfig] = useState<TFMConfig | null>(initialConfig)
    const [resources, setResources] = useState<TFMResource[]>(initialResources)
    const [isEditingConfig, setIsEditingConfig] = useState(false)
    const [isAddingResource, setIsAddingResource] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleUpdateConfig(formData: FormData) {
        setLoading(true)
        const result = await updateTFMConfig(formData)
        setLoading(false)
        if (result.success) {
            toast.success("Detalles actualizados")
            setIsEditingConfig(false)
            window.location.reload()
        } else {
            toast.error(result.error || "Error al actualizar")
        }
    }

    async function handleAddResource(formData: FormData) {
        setLoading(true)
        const result = await createTFMResource(formData)
        setLoading(false)
        if (result.success) {
            toast.success("Recurso añadido")
            setIsAddingResource(false)
            window.location.reload()
        } else {
            toast.error(result.error || "Error al añadir recurso")
        }
    }

    async function handleDeleteResource(id: string) {
        if (!confirm('¿Eliminar este recurso?')) return
        const result = await deleteTFMResource(id)
        if (result.success) {
            setResources(resources.filter(r => r.id !== id))
            toast.success("Recurso eliminado")
        } else {
            toast.error(result.error || "Error al eliminar")
        }
    }

    return (
        <div className="space-y-6">
            {/* Project Details Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6 group relative">
                <button
                    onClick={() => setIsEditingConfig(true)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Editar"
                >
                    <Edit2 className="h-4 w-4" />
                </button>

                <h3 className="font-semibold text-slate-900 mb-4">Detalles del Proyecto</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Título Provisional</label>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                            {config?.title || <span className="text-slate-400 italic">Sin definir</span>}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Tutor/a</label>
                        <div className="flex items-center mt-1">
                            {config?.tutorInitials && (
                                <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-2">
                                    {config.tutorInitials}
                                </div>
                            )}
                            <p className="text-sm font-medium text-slate-900">
                                {config?.tutor || <span className="text-slate-400 italic">Sin asignar</span>}
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Linea de Investigación</label>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                            {config?.researchLine || <span className="text-slate-400 italic">Sin definir</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Resources Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 group relative">
                <button
                    onClick={() => setIsAddingResource(true)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Añadir recurso"
                >
                    <Plus className="h-4 w-4" />
                </button>

                <h3 className="font-semibold text-slate-900 mb-4">Recursos</h3>
                {resources.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No hay recursos. Haz clic en + para añadir.</p>
                ) : (
                    <ul className="space-y-3">
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center justify-between group/item">
                                <a
                                    href={resource.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-sm text-blue-600 hover:underline"
                                >
                                    <FileText className="h-4 w-4 mr-2 shrink-0" />
                                    <span className="truncate">{resource.title}</span>
                                    {resource.url && <ExternalLink className="h-3 w-3 ml-1 shrink-0 opacity-50" />}
                                </a>
                                <button
                                    onClick={() => handleDeleteResource(resource.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Edit Config Modal */}
            {isEditingConfig && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Editar Detalles</h3>
                            <button onClick={() => setIsEditingConfig(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={handleUpdateConfig} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título Provisional</label>
                                <input
                                    name="title"
                                    defaultValue={config?.title || ''}
                                    placeholder="Ej: Impacto de la Gamificación..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tutor/a</label>
                                    <input
                                        name="tutor"
                                        defaultValue={config?.tutor || ''}
                                        placeholder="Dr. Juan Docente"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Iniciales</label>
                                    <input
                                        name="tutorInitials"
                                        defaultValue={config?.tutorInitials || ''}
                                        placeholder="JD"
                                        maxLength={3}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Línea de Investigación</label>
                                <input
                                    name="researchLine"
                                    defaultValue={config?.researchLine || ''}
                                    placeholder="Innovación Educativa"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Convocatoria</label>
                                <input
                                    name="convocatoria"
                                    defaultValue={config?.convocatoria || ''}
                                    placeholder="Julio 2026"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingConfig(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Resource Modal */}
            {isAddingResource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Añadir Recurso</h3>
                            <button onClick={() => setIsAddingResource(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={handleAddResource} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Recurso</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="Ej: Guía Docente TFM 2025"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL (opcional)</label>
                                <input
                                    name="url"
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingResource(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                >
                                    {loading ? 'Añadiendo...' : 'Añadir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
