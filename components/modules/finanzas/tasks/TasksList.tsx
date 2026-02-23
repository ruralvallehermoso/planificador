'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react'
import { clsx } from 'clsx'
import { type FinanzasTask } from '@prisma/client'

interface TasksListProps {
    tasks: FinanzasTask[]
    onEdit: (task: FinanzasTask) => void
    onDelete: (taskId: string) => void
    onToggleStatus: (task: FinanzasTask) => void
}

const statusColors = {
    TODO: 'bg-slate-100 text-slate-700 border-slate-200',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200'
}

const statusLabels: Record<string, string> = {
    TODO: 'Por Hacer',
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completada'
}

export function TasksList({ tasks, onEdit, onDelete, onToggleStatus }: TasksListProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No hay tareas pendientes</h3>
                <p className="text-slate-500 text-center max-w-sm">
                    Crea una nueva tarea para empezar a organizar tus finanzas.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={clsx(
                        "group flex items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border transition-all duration-200 hover:shadow-md",
                        task.status === 'COMPLETED' ? "border-slate-100 opacity-75" : "border-slate-200"
                    )}
                >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0 pr-4">
                        <button
                            onClick={() => onToggleStatus(task)}
                            className="mt-1 sm:mt-0 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full transition-transform hover:scale-110"
                        >
                            {task.status === 'COMPLETED' ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                                <Circle className="w-6 h-6 text-slate-300 hover:text-blue-500 transition-colors" />
                            )}
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            <h4 className={clsx(
                                "text-base font-semibold truncate",
                                task.status === 'COMPLETED' ? "text-slate-500 line-through" : "text-slate-900"
                            )}>
                                {task.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                    statusColors[task.status as keyof typeof statusColors] || statusColors.TODO
                                )}>
                                    {statusLabels[task.status] || task.status}
                                </span>

                                {task.dueDate && (
                                    <span className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                        {format(new Date(task.dueDate), "d MMM, yyyy", { locale: es })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                            onClick={() => onEdit(task)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar tarea"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar tarea"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
