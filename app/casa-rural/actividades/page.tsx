'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ClipboardList, Plus, Pencil, Trash2, X, Check, Calendar, Tag, Filter } from 'lucide-react'

interface Activity {
    id: string
    title: string
    description: string | null
    category: string
    date: string
    user: { id: string; name: string | null; email: string }
    createdAt: string
}

interface ActivityFormData {
    title: string
    description: string
    category: string
    date: string
}

const CATEGORIES = [
    { value: 'limpieza', label: 'Limpieza', color: 'bg-blue-100 text-blue-700' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: 'bg-orange-100 text-orange-700' },
    { value: 'compras', label: 'Compras', color: 'bg-green-100 text-green-700' },
    { value: 'incidencia', label: 'Incidencia', color: 'bg-red-100 text-red-700' },
    { value: 'otro', label: 'Otro', color: 'bg-slate-100 text-slate-700' },
]

const emptyFormData: ActivityFormData = {
    title: '',
    description: '',
    category: 'limpieza',
    date: new Date().toISOString().slice(0, 16),
}

export default function ActividadesPage() {
    const { data: session } = useSession()
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [filterCategory, setFilterCategory] = useState('all')

    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
    const [formData, setFormData] = useState<ActivityFormData>(emptyFormData)
    const [saving, setSaving] = useState(false)

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        fetchActivities()
    }, [filterCategory])

    const fetchActivities = async () => {
        try {
            const params = new URLSearchParams()
            if (filterCategory !== 'all') params.set('category', filterCategory)

            const res = await fetch(`/api/casa-rural/actividades?${params}`)
            if (!res.ok) throw new Error('Error al cargar actividades')
            const data = await res.json()
            setActivities(data)
        } catch (err) {
            setError('Error al cargar las actividades')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingActivity(null)
        setFormData({ ...emptyFormData, date: new Date().toISOString().slice(0, 16) })
        setShowModal(true)
    }

    const openEditModal = (activity: Activity) => {
        setEditingActivity(activity)
        setFormData({
            title: activity.title,
            description: activity.description || '',
            category: activity.category,
            date: new Date(activity.date).toISOString().slice(0, 16),
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingActivity(null)
        setFormData(emptyFormData)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const url = editingActivity
                ? `/api/casa-rural/actividades/${editingActivity.id}`
                : '/api/casa-rural/actividades'
            const method = editingActivity ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Error al guardar actividad')
            }

            await fetchActivities()
            closeModal()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/casa-rural/actividades/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Error al eliminar actividad')
            }
            await fetchActivities()
            setDeleteConfirm(null)
        } catch (err: any) {
            setError(err.message)
        }
    }

    const getCategoryInfo = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[4]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-emerald-600" />
                        Registro de Actividades
                    </h1>
                    <p className="text-slate-500 mt-1">Cuadro de mandos del empleado</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Actividad
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                    <option value="all">Todas las categorías</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Activities list */}
            <div className="space-y-3">
                {activities.map(activity => {
                    const catInfo = getCategoryInfo(activity.category)
                    return (
                        <div
                            key={activity.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${catInfo.color}`}>
                                            {catInfo.label}
                                        </span>
                                        <span className="text-sm text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(activity.date).toLocaleDateString('es-ES', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">{activity.title}</h3>
                                    {activity.description && (
                                        <p className="text-slate-600 mt-1">{activity.description}</p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-2">
                                        Por: {activity.user.name || activity.user.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(activity.user.id === session?.user?.id || session?.user?.role === 'ADMIN') && (
                                        <>
                                            <button
                                                onClick={() => openEditModal(activity)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {deleteConfirm === activity.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(activity.id)}
                                                        className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                                        title="Confirmar"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(activity.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {activities.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500">No hay actividades registradas</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Registrar primera actividad
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
                            </h2>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="¿Qué actividad realizaste?"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y hora</label>
                                <input
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                                    rows={3}
                                    placeholder="Detalles adicionales (opcional)"
                                />
                            </div>

                            {/* Error in form */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Guardando...' : editingActivity ? 'Actualizar' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
