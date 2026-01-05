'use client'

import { useState } from 'react'
import { Plus, Edit2, X, GripVertical, Check } from 'lucide-react'
import { createTask, toggleTaskStatus, updateTask, moveTaskToSection, createSection, updateSection, deleteSection } from '@/lib/actions/teacher'

interface Task {
    id: string
    title: string
    status: string
    sectionId: string | null
}

interface Section {
    id: string
    name: string
    order: number
}

export function SidebarTaskManager({ 
    tasks, 
    sections, 
    categoryId, 
    categorySlug 
}: { 
    tasks: Task[], 
    sections: Section[], 
    categoryId: string, 
    categorySlug?: string 
}) {
    const [isCreatingTask, setIsCreatingTask] = useState(false)
    const [isCreatingSection, setIsCreatingSection] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newSectionName, setNewSectionName] = useState('')
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
    const [editingTaskTitle, setEditingTaskTitle] = useState('')
    const [editingSectionName, setEditingSectionName] = useState('')
    const [selectedSectionForTask, setSelectedSectionForTask] = useState<string | null>(null)
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
    const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)

    // Group tasks by section
    const tasksBySection = new Map<string | null, Task[]>()
    tasksBySection.set(null, []) // Tasks without section
    
    sections.forEach(section => {
        tasksBySection.set(section.id, [])
    })
    
    tasks.forEach(task => {
        const sectionId = task.sectionId || null
        const sectionTasks = tasksBySection.get(sectionId) || []
        sectionTasks.push(task)
        tasksBySection.set(sectionId, sectionTasks)
    })

    async function handleToggle(taskId: string, status: string) {
        await toggleTaskStatus(taskId, status, categorySlug)
    }

    async function handleCreateTask(e: React.FormEvent, sectionId: string | null = null) {
        e.preventDefault()
        if (newTaskTitle.trim()) {
            const result = await createTask({ title: newTaskTitle, categoryId, categorySlug })
            if (result.success && result.data && sectionId) {
                // Move task to section after creation
                await moveTaskToSection({ taskId: result.data.id, sectionId, categorySlug })
            }
            setNewTaskTitle('')
            setIsCreatingTask(false)
        }
    }

    async function handleCreateSection(e: React.FormEvent) {
        e.preventDefault()
        if (newSectionName.trim()) {
            await createSection({ name: newSectionName, categoryId, categorySlug })
            setNewSectionName('')
            setIsCreatingSection(false)
        }
    }

    async function handleUpdateTask(taskId: string) {
        if (editingTaskTitle.trim()) {
            await updateTask({ taskId, title: editingTaskTitle, categorySlug })
            setEditingTaskId(null)
            setEditingTaskTitle('')
        }
    }

    async function handleUpdateSection(sectionId: string) {
        if (editingSectionName.trim()) {
            await updateSection({ sectionId, name: editingSectionName, categorySlug })
            setEditingSectionId(null)
            setEditingSectionName('')
        }
    }

    async function handleDeleteSection(sectionId: string) {
        if (confirm('¿Estás seguro de que quieres eliminar esta sección? Las tareas se moverán a "Sin sección".')) {
            await deleteSection({ sectionId, categorySlug })
        }
    }

    async function handleMoveTask(taskId: string, newSectionId: string | null) {
        await moveTaskToSection({ taskId, sectionId: newSectionId, categorySlug })
        setSelectedSectionForTask(null)
    }

    function handleDragStart(taskId: string) {
        setDraggedTaskId(taskId)
    }

    function handleDragEnd() {
        setDraggedTaskId(null)
        setDragOverSectionId(null)
    }

    function handleDragOver(e: React.DragEvent, sectionId: string | null) {
        e.preventDefault()
        e.stopPropagation()
        setDragOverSectionId(sectionId)
    }

    function handleDragLeave() {
        setDragOverSectionId(null)
    }

    async function handleDrop(e: React.DragEvent, targetSectionId: string | null) {
        e.preventDefault()
        e.stopPropagation()
        
        if (draggedTaskId) {
            // Only move if it's a different section
            const draggedTask = tasks.find(t => t.id === draggedTaskId)
            if (draggedTask && draggedTask.sectionId !== targetSectionId) {
                await handleMoveTask(draggedTaskId, targetSectionId)
            }
        }
        
        setDraggedTaskId(null)
        setDragOverSectionId(null)
    }

    function startEditingTask(task: Task) {
        setEditingTaskId(task.id)
        setEditingTaskTitle(task.title)
    }

    function startEditingSection(section: Section) {
        setEditingSectionId(section.id)
        setEditingSectionName(section.name)
    }

    function cancelEditing() {
        setEditingTaskId(null)
        setEditingSectionId(null)
        setEditingTaskTitle('')
        setEditingSectionName('')
    }

    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order)

    return (
        <div className="space-y-4">
            {/* Sections */}
            {sortedSections.map(section => {
                const sectionTasks = tasksBySection.get(section.id) || []
                return (
                    <div 
                        key={section.id} 
                        className={`border rounded-lg p-3 transition-colors ${
                            dragOverSectionId === section.id 
                                ? 'border-indigo-400 bg-indigo-50 border-2' 
                                : 'border-gray-200 bg-gray-50'
                        }`}
                        onDragOver={(e) => handleDragOver(e, section.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, section.id)}
                    >
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-2">
                            {editingSectionId === section.id ? (
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        handleUpdateSection(section.id)
                                    }}
                                    className="flex-1 flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        autoFocus
                                        value={editingSectionName}
                                        onChange={(e) => setEditingSectionName(e.target.value)}
                                        className="flex-1 text-sm font-semibold border-gray-300 rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        onBlur={() => {
                                            if (editingSectionName.trim()) {
                                                handleUpdateSection(section.id)
                                            } else {
                                                cancelEditing()
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') cancelEditing()
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <h4 
                                        className="text-sm font-semibold text-gray-700 flex-1 cursor-pointer hover:text-indigo-600"
                                        onClick={() => startEditingSection(section)}
                                    >
                                        {section.name}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => startEditingSection(section)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSection(section.id)}
                                            className="text-gray-400 hover:text-red-600 p-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Tasks in Section */}
                        <div 
                            className="space-y-2 ml-2 min-h-[40px]"
                        >
                            {sectionTasks.length === 0 && dragOverSectionId === section.id && draggedTaskId && (
                                <div className="text-center py-2 text-sm text-indigo-600 border-2 border-dashed border-indigo-300 rounded">
                                    Soltar aquí para mover a "{section.name}"
                                </div>
                            )}
                            {sectionTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    editingTaskId={editingTaskId}
                                    editingTaskTitle={editingTaskTitle}
                                    selectedSectionForTask={selectedSectionForTask}
                                    sections={sortedSections}
                                    draggedTaskId={draggedTaskId}
                                    onToggle={() => handleToggle(task.id, task.status)}
                                    onStartEdit={() => startEditingTask(task)}
                                    onUpdate={() => handleUpdateTask(task.id)}
                                    onMove={(sectionId) => handleMoveTask(task.id, sectionId)}
                                    onSetEditingTitle={setEditingTaskTitle}
                                    onSetSelectedSection={setSelectedSectionForTask}
                                    onCancelEdit={cancelEditing}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                />
                            ))}
                            
                            {/* Add task to section */}
                            {isCreatingTask && selectedSectionForTask === section.id ? (
                                <form onSubmit={(e) => handleCreateTask(e, section.id)} className="mt-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Nueva tarea..."
                                        className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 border"
                                        onBlur={() => {
                                            if (!newTaskTitle) {
                                                setIsCreatingTask(false)
                                                setSelectedSectionForTask(null)
                                            }
                                        }}
                                    />
                                </form>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsCreatingTask(true)
                                        setSelectedSectionForTask(section.id)
                                    }}
                                    className="w-full mt-1 flex items-center justify-center p-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded border border-dashed border-gray-300 transition-colors"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Añadir tarea
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}

            {/* Tasks without section */}
            {(tasksBySection.get(null) && tasksBySection.get(null)!.length > 0) || dragOverSectionId === null ? (
                <div 
                    className={`space-y-2 border-t pt-4 mt-4 transition-colors min-h-[60px] ${
                        dragOverSectionId === null && draggedTaskId
                            ? 'border-indigo-400 border-2 bg-indigo-50' 
                            : 'border-gray-200'
                    }`}
                    onDragOver={(e) => handleDragOver(e, null)}
                    onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            handleDragLeave()
                        }
                    }}
                    onDrop={(e) => handleDrop(e, null)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-sm font-semibold ${
                            dragOverSectionId === null && draggedTaskId 
                                ? 'text-indigo-600' 
                                : 'text-gray-500'
                        }`}>
                            Sin sección
                        </h4>
                        {tasksBySection.get(null) && tasksBySection.get(null)!.length > 0 && (
                            <span className="text-xs text-gray-400">{tasksBySection.get(null)!.length} tarea(s)</span>
                        )}
                    </div>
                    {tasksBySection.get(null) && tasksBySection.get(null)!.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            editingTaskId={editingTaskId}
                            editingTaskTitle={editingTaskTitle}
                            selectedSectionForTask={selectedSectionForTask}
                            sections={sortedSections}
                            draggedTaskId={draggedTaskId}
                            onToggle={() => handleToggle(task.id, task.status)}
                            onStartEdit={() => startEditingTask(task)}
                            onUpdate={() => handleUpdateTask(task.id)}
                            onMove={(sectionId) => handleMoveTask(task.id, sectionId)}
                            onSetEditingTitle={setEditingTaskTitle}
                            onSetSelectedSection={setSelectedSectionForTask}
                            onCancelEdit={cancelEditing}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                    {dragOverSectionId === null && draggedTaskId && tasksBySection.get(null)?.find(t => t.id === draggedTaskId) === undefined && (
                        <div className="text-center py-2 text-sm text-indigo-600 border-2 border-dashed border-indigo-300 rounded">
                            Soltar aquí para mover a "Sin sección"
                        </div>
                    )}
                </div>
            ) : null}

            {/* Add new section */}
            {isCreatingSection ? (
                <form onSubmit={handleCreateSection} className="mt-2">
                    <input
                        type="text"
                        autoFocus
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="Nombre de la sección..."
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border shadow-sm"
                        onBlur={() => !newSectionName && setIsCreatingSection(false)}
                    />
                </form>
            ) : (
                <button
                    onClick={() => setIsCreatingSection(true)}
                    className="w-full mt-2 flex items-center justify-center p-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md border border-dashed border-gray-300 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir Sección
                </button>
            )}

            {/* Add task without section */}
            {!isCreatingTask && (
                <button
                    onClick={() => {
                        setIsCreatingTask(true)
                        setSelectedSectionForTask(null)
                    }}
                    className="w-full mt-2 flex items-center justify-center p-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md border border-dashed border-gray-300 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir Tarea
                </button>
            )}
            {isCreatingTask && selectedSectionForTask === null && (
                <form onSubmit={(e) => handleCreateTask(e, null)} className="mt-2">
                    <input
                        type="text"
                        autoFocus
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Nueva tarea..."
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border shadow-sm"
                        onBlur={() => {
                            if (!newTaskTitle) {
                                setIsCreatingTask(false)
                                setSelectedSectionForTask(null)
                            }
                        }}
                    />
                </form>
            )}
        </div>
    )
}

function TaskItem({
    task,
    editingTaskId,
    editingTaskTitle,
    selectedSectionForTask,
    sections,
    draggedTaskId,
    onToggle,
    onStartEdit,
    onUpdate,
    onMove,
    onSetEditingTitle,
    onSetSelectedSection,
    onCancelEdit,
    onDragStart,
    onDragEnd
}: {
    task: Task
    editingTaskId: string | null
    editingTaskTitle: string
    selectedSectionForTask: string | null
    sections: Section[]
    draggedTaskId: string | null
    onToggle: () => void
    onStartEdit: () => void
    onUpdate: () => void
    onMove: (sectionId: string | null) => void
    onSetEditingTitle: (title: string) => void
    onSetSelectedSection: (taskId: string | null) => void
    onCancelEdit: () => void
    onDragStart: (taskId: string) => void
    onDragEnd: () => void
}) {
    const isEditing = editingTaskId === task.id
    const isMoving = selectedSectionForTask === task.id
    const isDragging = draggedTaskId === task.id

    return (
        <div 
            className={`flex items-start gap-2 text-sm group -mx-1 px-1 py-0.5 rounded transition-all ${
                isDragging 
                    ? 'opacity-50 cursor-grabbing scale-95' 
                    : 'hover:bg-gray-50 cursor-grab active:cursor-grabbing'
            }`}
            draggable={!isEditing}
            onDragStart={(e) => {
                if (!isEditing) {
                    onDragStart(task.id)
                    // Set drag image
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', task.id)
                }
            }}
            onDragEnd={onDragEnd}
        >
            <div
                className={`mt-0.5 h-4 w-4 rounded-full border cursor-pointer flex-shrink-0 transition-colors ${task.status === 'DONE' ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-indigo-500'}`}
                onClick={onToggle}
                title={task.status === 'DONE' ? 'Marcar como pendiente' : 'Marcar como completada'}
            />
            {isEditing ? (
                <form 
                    onSubmit={(e) => {
                        e.preventDefault()
                        onUpdate()
                    }}
                    className="flex-1 flex items-center gap-2"
                >
                    <input
                        type="text"
                        autoFocus
                        value={editingTaskTitle}
                        onChange={(e) => onSetEditingTitle(e.target.value)}
                        className={`flex-1 border-gray-300 rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500 ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}
                        onBlur={() => {
                            if (editingTaskTitle.trim()) {
                                onUpdate()
                            } else {
                                onCancelEdit()
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') onCancelEdit()
                        }}
                    />
                    <button
                        type="submit"
                        className="text-green-600 hover:text-green-700"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                </form>
            ) : (
                <>
                    <div 
                        className={`flex-1 cursor-pointer hover:text-indigo-600 ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}
                        onClick={onStartEdit}
                    >
                        {task.title}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={onStartEdit}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Editar tarea"
                        >
                            <Edit2 className="h-3 w-3" />
                        </button>
                        {isMoving ? (
                            <div className="relative">
                                <select
                                    autoFocus
                                    className="text-xs border-gray-300 rounded px-2 py-1 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    onChange={(e) => {
                                        const value = e.target.value
                                        onMove(value === 'none' ? null : value)
                                    }}
                                    onBlur={() => onSetSelectedSection(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            onSetSelectedSection(null)
                                        }
                                    }}
                                >
                                    <option value="">Seleccionar sección...</option>
                                    <option value="none">Sin sección</option>
                                    {sections.map(section => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <button
                                onClick={() => onSetSelectedSection(task.id)}
                                className="text-gray-400 hover:text-indigo-600 p-1 transition-colors"
                                title="Mover a sección (haz clic para seleccionar)"
                            >
                                <GripVertical className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
