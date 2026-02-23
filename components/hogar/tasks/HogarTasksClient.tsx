'use client';

import { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, CheckCircle2, Circle, Clock, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string; // TODO, IN_PROGRESS, DONE
    priority: string; // LOW, MEDIUM, HIGH
    dueDate: string | null;
    createdAt: string;
}

export default function HogarTasksClient() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // Fetch ActionItems for hogar category
            const res = await fetch('/api/tasks?category=hogar');
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const data = await res.json();
            setTasks(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskTitle,
                    categorySlug: 'hogar',
                    dueDate: newTaskDueDate || null,
                    status: 'TODO'
                }),
            });

            if (!res.ok) throw new Error('Failed to create task');

            const newTask = await res.json();
            setTasks([newTask, ...tasks]);
            setNewTaskTitle('');
            setNewTaskDueDate('');
            setIsAdding(false);
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleToggleTaskStatus = async (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        // Optimistic update
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH', // api/tasks/[id] accepts PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                // Revert on error
                setTasks(tasks);
                throw new Error('Failed to update task');
            }
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('¿Eliminar esta tarea?')) return;

        // Optimistic delete
        const prevTasks = [...tasks];
        setTasks(tasks.filter(t => t.id !== id));

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                setTasks(prevTasks);
                throw new Error('Failed to delete task');
            }
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto mt-8">
                <AlertCircle className="w-5 h-5" />
                <p>Error cargando tareas: {error}</p>
            </div>
        );
    }

    const pendingTasks = tasks.filter(t => t.status !== 'DONE');
    const completedTasks = tasks.filter(t => t.status === 'DONE');

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-sm">
                    <ClipboardCheck className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tareas del Hogar</h1>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Organiza las reparaciones, limpiezas y deberes diarios de la casa.
                </p>
                <div className="flex justify-center gap-6 mt-6">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{tasks.length}</span>
                        <span className="text-sm text-gray-500 font-medium">Total</span>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <span className="text-2xl font-bold leading-none text-blue-600">{pendingTasks.length}</span>
                        <span className="text-sm text-gray-500 font-medium leading-none">Pendientes</span>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <span className="text-2xl font-bold leading-none text-emerald-600">{completedTasks.length}</span>
                        <span className="text-sm text-gray-500 font-medium leading-none">Completadas</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Listado de Tareas</h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> Nueva Tarea
                    </button>
                </div>

                {isAdding && (
                    <div className="p-6 border-b border-gray-100 bg-blue-50/30">
                        <form onSubmit={handleCreateTask} className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="¿Qué hay que hacer? (ej. Limpiar ventanas)"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                autoFocus
                            />
                            <div className="flex gap-4">
                                <input
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!newTaskTitle.trim()}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="divide-y divide-gray-100">
                    {tasks.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <ClipboardCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900 mb-1">Todo al día</p>
                            <p>No hay tareas registradas en la casa.</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-5 flex items-center gap-4 group transition-colors hover:bg-gray-50/80 ${task.status === 'DONE' ? 'bg-gray-50/50' : 'bg-white'}`}
                            >
                                <button
                                    onClick={() => handleToggleTaskStatus(task)}
                                    className="flex-shrink-0 focus:outline-none transition-transform hover:scale-110"
                                >
                                    {task.status === 'DONE' ? (
                                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-7 h-7 text-gray-300 hover:text-blue-500 transition-colors" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-medium text-lg truncate transition-colors ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        {task.title}
                                    </h3>
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500 font-medium' : ''}>
                                                {new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar tarea"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
