'use client'

import { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"
import { createSubjectTask, toggleSubjectTask, deleteSubjectTask } from "@/lib/actions/master-subjects"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Task {
    id: string
    title: string
    isCompleted: boolean
}

interface SubjectTasksProps {
    tasks: Task[]
    subjectId: string
    categoryId: string
}

export function SubjectTasks({ tasks, subjectId, categoryId }: SubjectTasksProps) {
    const [newTask, setNewTask] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newTask.trim()) return

        setIsCreating(true)
        try {
            const result = await createSubjectTask(subjectId, newTask, categoryId)
            if (result.success) {
                setNewTask("")
                toast.success("Tarea añadida")
            } else {
                toast.error("Error al añadir tarea")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsCreating(false)
        }
    }

    async function handleToggle(taskId: string, currentStatus: boolean) {
        try {
            const result = await toggleSubjectTask(taskId, !currentStatus)
            if (!result.success) {
                toast.error("Error al actualizar tarea")
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function handleDelete(taskId: string) {
        if (!confirm("¿Borrar tarea?")) return
        try {
            const result = await deleteSubjectTask(taskId)
            if (result.success) {
                toast.success("Tarea eliminada")
            } else {
                toast.error("Error al eliminar tarea")
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
                <span>Tareas Pendientes</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {tasks.filter(t => !t.isCompleted).length}
                </span>
            </h3>

            <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                <Input
                    placeholder="Nueva tarea..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="h-9 text-sm"
                />
                <Button type="submit" size="sm" disabled={isCreating || !newTask.trim()} className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800">
                    <Plus className="h-4 w-4 text-white" />
                </Button>
            </form>

            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center italic py-2">No hay tareas pendientes</p>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="flex items-start gap-3 group">
                            <button
                                onClick={() => handleToggle(task.id, task.isCompleted)}
                                className={cn(
                                    "mt-0.5 flex-shrink-0 transition-colors",
                                    task.isCompleted ? "text-green-500" : "text-slate-300 hover:text-slate-400"
                                )}
                            >
                                {task.isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <Circle className="h-5 w-5" />
                                )}
                            </button>
                            <span className={cn(
                                "text-sm flex-1 leading-tight pt-0.5 transition-all duration-200",
                                task.isCompleted ? "text-slate-400 line-through" : "text-slate-700"
                            )}>
                                {task.title}
                            </span>
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
