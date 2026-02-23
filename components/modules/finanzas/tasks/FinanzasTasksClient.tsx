'use client'

import { useState, useEffect } from 'react'
import { type FinanzasTask } from '@prisma/client'
import { Plus, Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { TasksList } from './TasksList'
import { TaskForm } from './TaskForm'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'

export function FinanzasTasksClient() {
    const { data: session } = useSession()
    const [tasks, setTasks] = useState<FinanzasTask[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<FinanzasTask | undefined>()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/finanzas/tasks')
            if (!res.ok) throw new Error('Error al cargar las tareas')
            const data = await res.json()
            setTasks(data)
        } catch (err) {
            console.error(err)
            setError('No se pudieron cargar las tareas. Por favor, intenta de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateTask = async (data: any) => {
        try {
            const res = await fetch('/api/finanzas/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Error al crear la tarea')

            await fetchTasks()
            setIsFormOpen(false)
        } catch (err) {
            console.error(err)
            alert('Error al crear la tarea')
        }
    }

    const handleUpdateTask = async (data: any) => {
        if (!editingTask) return

        try {
            const res = await fetch(`/api/finanzas/tasks/${editingTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Error al actualizar la tarea')

            await fetchTasks()
            setEditingTask(undefined)
            setIsFormOpen(false)
        } catch (err) {
            console.error(err)
            alert('Error al actualizar la tarea')
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return

        try {
            const res = await fetch(`/api/finanzas/tasks/${taskId}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Error al eliminar la tarea')

            await fetchTasks()
        } catch (err) {
            console.error(err)
            alert('Error al eliminar la tarea')
        }
    }

    const handleToggleStatus = async (task: FinanzasTask) => {
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

        try {
            const res = await fetch(`/api/finanzas/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) throw new Error('Error al actualizar el estado')

            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
        } catch (err) {
            console.error(err)
            alert('Error al actualizar el estado de la tarea')
        }
    }

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        pending: tasks.filter(t => t.status !== 'COMPLETED').length
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Tareas</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Completadas</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Pendientes</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                    </div>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                    Mis Tareas
                </h2>
                {!isFormOpen && (
                    <button
                        onClick={() => {
                            setEditingTask(undefined)
                            setIsFormOpen(true)
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 hover:shadow hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Tarea
                    </button>
                )}
            </div>

            {/* Form Area */}
            {isFormOpen && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <TaskForm
                        task={editingTask}
                        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                        onCancel={() => {
                            setIsFormOpen(false)
                            setEditingTask(undefined)
                        }}
                    />
                </div>
            )}

            {/* Tasks List */}
            {!isFormOpen && (
                <TasksList
                    tasks={tasks}
                    onEdit={(task) => {
                        setEditingTask(task)
                        setIsFormOpen(true)
                    }}
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                />
            )}
        </div>
    )
}
