'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListTodo, Loader2, Edit2, X, Check } from 'lucide-react';
import { addMasterTask, toggleMasterTask, deleteMasterTask, updateMasterTask } from '@/app/master-unie/actions';
import { cn } from '@/lib/utils';

interface MasterTask {
    id: string;
    title: string;
    completed: boolean;
}

interface MasterTaskListProps {
    tasks: MasterTask[];
}

export function MasterTaskList({ tasks = [] }: MasterTaskListProps) {
    const [newItemTitle, setNewItemTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [isPending, startTransition] = useTransition();

    const startEditing = (task: MasterTask) => {
        setEditingId(task.id);
        setEditTitle(task.title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle('');
    };

    const saveEdit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!editingId || !editTitle.trim()) return;

        startTransition(async () => {
            try {
                await updateMasterTask(editingId, editTitle);
                setEditingId(null);
            } catch (error) {
                console.error("Failed to update task", error);
            }
        });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        startTransition(async () => {
            try {
                await addMasterTask(newItemTitle);
                setNewItemTitle('');
            } catch (error) {
                console.error("Failed to add task", error);
            }
        });
    };

    const handleToggle = (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            try {
                await toggleMasterTask(id, !currentStatus);
            } catch (error) {
                console.error("Failed to toggle task", error);
            }
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteMasterTask(id);
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        });
    };

    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-lg text-slate-900">Tareas Pendientes</h3>
                </div>
                <div className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {completedCount}/{tasks.length}
                </div>
            </div>

            <div className="flex-1 p-6 relative">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {tasks.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            <p>No hay tareas pendientes.</p>
                            <p>¡Añade recordatorios aquí!</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                {editingId === task.id ? (
                                    <div className="flex items-center gap-2 flex-1 animate-in fade-in duration-200">
                                        <Input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="h-8 text-sm"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit();
                                                if (e.key === 'Escape') cancelEditing();
                                            }}
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => saveEdit()}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={cancelEditing}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Checkbox
                                                id={`task-${task.id}`}
                                                checked={task.completed}
                                                onCheckedChange={() => handleToggle(task.id, task.completed)}
                                                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                            />
                                            <label
                                                htmlFor={`task-${task.id}`}
                                                className={cn(
                                                    "text-sm cursor-pointer select-none truncate flex-1",
                                                    task.completed && "text-slate-400 line-through decoration-slate-300"
                                                )}
                                                onDoubleClick={() => startEditing(task)}
                                            >
                                                {task.title}
                                            </label>
                                        </div>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-500"
                                                onClick={() => startEditing(task)}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                onClick={() => handleDelete(task.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t mt-auto">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <Input
                        placeholder="Nueva tarea..."
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        className="bg-white"
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !newItemTitle.trim()} className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
