'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Clock, Edit2, Plus, Trash2, X, Calendar, FileText } from 'lucide-react'
import { createTFMItem, updateTFMItem, deleteTFMItem } from '@/lib/actions/tfm'
import { toast } from 'sonner'

interface TFMItem {
    id: string
    title: string
    description: string | null
    date: Date | null
    status: string
    order: number
}

interface TFMListProps {
    initialItems: TFMItem[]
}

export function TFMList({ initialItems }: TFMListProps) {
    const [items, setItems] = useState<TFMItem[]>(initialItems)
    const [selectedItem, setSelectedItem] = useState<TFMItem | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(false)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-7 w-7 text-green-500" />
            case 'IN_PROGRESS':
                return <Clock className="h-7 w-7 text-amber-500 animate-pulse" />
            default:
                return <Circle className="h-7 w-7 text-slate-300" />
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return null
        return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    async function handleCreate(formData: FormData) {
        setLoading(true)
        const result = await createTFMItem(formData)
        setLoading(false)
        if (result.success) {
            toast.success("Hito creado correctamente")
            setIsCreating(false)
            // Reload page to get fresh data
            window.location.reload()
        } else {
            toast.error(result.error || "Error al crear")
        }
    }

    async function handleUpdate(formData: FormData) {
        if (!selectedItem) return
        setLoading(true)
        const result = await updateTFMItem(selectedItem.id, formData)
        setLoading(false)
        if (result.success) {
            toast.success("Hito actualizado")
            setIsEditing(false)
            setSelectedItem(null)
            window.location.reload()
        } else {
            toast.error(result.error || "Error al actualizar")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este hito?')) return
        const result = await deleteTFMItem(id)
        if (result.success) {
            setItems(items.filter(i => i.id !== id))
            setSelectedItem(null)
            toast.success("Hito eliminado")
        } else {
            toast.error(result.error || "Error al eliminar")
        }
    }

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-end">
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Hito
                </button>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Hitos del Proyecto</h2>

                {items.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No hay hitos definidos. Crea el primero.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Connector Line */}
                        <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-slate-100"></div>

                        <div className="space-y-6 relative">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`flex items-start space-x-4 p-4 -mx-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:shadow-md ${selectedItem?.id === item.id ? 'bg-indigo-50 ring-2 ring-indigo-300' : ''}`}
                                >
                                    <div className="bg-white z-10 rounded-full">
                                        {getStatusIcon(item.status)}
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-semibold text-lg ${item.status === 'PENDING' ? 'text-slate-400' : 'text-slate-900'}`}>
                                                    {item.title}
                                                </h3>
                                                {item.description && (
                                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                                                )}
                                            </div>
                                            {item.date && (
                                                <span className="text-sm text-slate-500 font-medium flex items-center gap-1 shrink-0">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(item.date)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Detail / Edit Modal */}
            {selectedItem && !isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(selectedItem.status)}
                                <h3 className="text-xl font-bold text-slate-900">{selectedItem.title}</h3>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {selectedItem.date && (
                            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(selectedItem.date)}
                            </p>
                        )}

                        {selectedItem.description ? (
                            <p className="text-slate-700 mb-6 whitespace-pre-wrap">{selectedItem.description}</p>
                        ) : (
                            <p className="text-slate-400 italic mb-6">Sin descripción</p>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => handleDelete(selectedItem.id)}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Trash2 className="h-4 w-4 inline mr-1" />
                                Eliminar
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                                <Edit2 className="h-4 w-4 inline mr-1" />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditing && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Editar Hito</h3>
                            <button onClick={() => { setIsEditing(false); setSelectedItem(null) }} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input
                                    name="title"
                                    defaultValue={selectedItem.title}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    defaultValue={selectedItem.description || ''}
                                    rows={4}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        name="date"
                                        defaultValue={selectedItem.date ? new Date(selectedItem.date).toISOString().split('T')[0] : ''}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                    <select
                                        name="status"
                                        defaultValue={selectedItem.status}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="PENDING">Pendiente</option>
                                        <option value="IN_PROGRESS">En Progreso</option>
                                        <option value="COMPLETED">Completado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(false); setSelectedItem(null) }}
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

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Nuevo Hito</h3>
                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="Ej: Revisión de bibliografía"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    placeholder="Detalla el contenido de este hito..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Objetivo</label>
                                    <input
                                        type="date"
                                        name="date"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                    <select
                                        name="status"
                                        defaultValue="PENDING"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="PENDING">Pendiente</option>
                                        <option value="IN_PROGRESS">En Progreso</option>
                                        <option value="COMPLETED">Completado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                >
                                    {loading ? 'Creando...' : 'Crear Hito'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
