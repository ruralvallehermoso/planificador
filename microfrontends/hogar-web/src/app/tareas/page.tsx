'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Tag, Filter, Loader2 } from 'lucide-react';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: Status;
    priority: Priority;
    dueDate?: string;
    createdAt: string;
}

// API base URL - use parent origin when embedded in iframe, or relative path
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        // Check if we're in an iframe
        if (window.parent !== window) {
            // Use the parent's origin (Planificador)
            return 'https://planificador-seven.vercel.app';
        }
    }
    // For local development or direct access
    return process.env.NEXT_PUBLIC_PLANIFICADOR_URL || 'https://planificador-seven.vercel.app';
};

export default function TareasPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newTodo, setNewTodo] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    // Fetch tasks on mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/api/tasks?category=hogar`);
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        setSaving(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTodo,
                    categorySlug: 'hogar',
                    priority: 'MEDIUM',
                    status: 'TODO'
                })
            });

            if (res.ok) {
                const task = await res.json();
                setTasks([task, ...tasks]);
                setNewTodo('');
            }
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleTask = async (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';

        // Optimistic update
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            await fetch(`${getApiUrl()}/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert on error
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: task.status } : t));
        }
    };

    const deleteTask = async (id: string) => {
        // Optimistic delete
        const previousTasks = tasks;
        setTasks(tasks.filter(t => t.id !== id));

        try {
            await fetch(`${getApiUrl()}/api/tasks/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting task:', error);
            setTasks(previousTasks);
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'active') return t.status !== 'DONE';
        if (filter === 'completed') return t.status === 'DONE';
        return true;
    });

    const pendingCount = tasks.filter(t => t.status !== 'DONE').length;
    const completedCount = tasks.filter(t => t.status === 'DONE').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tareas del Hogar 📝</h1>
                <p className="text-gray-500">
                    {pendingCount > 0
                        ? `${pendingCount} tareas pendientes • ${completedCount} completadas`
                        : 'Todas las tareas completadas ✓'
                    }
                </p>
            </div>

            {/* Creation Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <form onSubmit={addTask} className="flex gap-4">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Añadir nueva tarea..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        disabled={saving}
                    />
                    <button
                        type="submit"
                        disabled={saving || !newTodo.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        Añadir
                    </button>
                </form>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? 'Todas' : f === 'active' ? 'Pendientes' : 'Completadas'}
                    </button>
                ))}
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        {filter === 'all'
                            ? 'No hay tareas. ¡Añade la primera!'
                            : filter === 'active'
                                ? 'No hay tareas pendientes'
                                : 'No hay tareas completadas'
                        }
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-center gap-4 p-4 bg-white rounded-xl border transition-all hover:shadow-md ${task.status === 'DONE'
                                    ? 'border-green-100 bg-green-50/50'
                                    : 'border-gray-100'
                                }`}
                        >
                            <button
                                onClick={() => toggleTask(task)}
                                className="flex-shrink-0"
                            >
                                {task.status === 'DONE' ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                    <Circle className="h-6 w-6 text-gray-300 hover:text-pink-500 transition-colors" />
                                )}
                            </button>

                            <span className={`flex-1 ${task.status === 'DONE'
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-900'
                                }`}>
                                {task.title}
                            </span>

                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'HIGH'
                                    ? 'bg-red-100 text-red-700'
                                    : task.priority === 'LOW'
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {task.priority === 'HIGH' ? 'Alta' : task.priority === 'LOW' ? 'Baja' : 'Media'}
                            </span>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
