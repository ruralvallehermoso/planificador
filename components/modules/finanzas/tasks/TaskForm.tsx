'use client'

import { useState, useEffect } from 'react'
import { type FinanzasTask } from '@prisma/client'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskFormProps {
    task?: FinanzasTask
    onSubmit: (data: any) => Promise<void>
    onCancel: () => void
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState(task?.title || '')
    const [status, setStatus] = useState(task?.status || 'PENDING')
    const [dueDate, setDueDate] = useState<string>(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsSubmitting(true)
        try {
            await onSubmit({
                title,
                status,
                dueDate: dueDate || null
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                    Título de la Tarea
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Revisar presupuesto mensual"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                        Estado
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    >
                        <option value="TODO">Por Hacer</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="IN_PROGRESS">En Progreso</option>
                        <option value="COMPLETED">Completada</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">
                        Fecha Límite
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="flex items-center justify-center min-w-[120px] px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        task ? 'Guardar Cambios' : 'Crear Tarea'
                    )}
                </button>
            </div>
        </form>
    )
}
