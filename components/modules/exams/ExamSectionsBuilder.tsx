"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import dynamic from "next/dynamic"

const RichTextEditor = dynamic(
    () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
    { ssr: false, loading: () => <div className="h-[150px] w-full border rounded-md bg-gray-50 animate-pulse" /> }
)

import { ExamSection } from "@/lib/actions/exams"
import { cn } from "@/lib/utils"
import { Plus, Trash2, GripVertical, TestTube, Code2, Type, Layout, Grip } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Props {
    sections: ExamSection[]
    onChange: (sections: ExamSection[]) => void
}

export function ExamSectionsBuilder({ sections, onChange }: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleAddSection = (type: ExamSection['type']) => {
        const newSection: ExamSection = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title: type === 'TEST' ? 'Preguntas Tipo Test' : (type === 'DEVELOP' ? 'Preguntas a Desarrollar' : 'Nueva Sección'),
            content: '',
            questions: '',
            ra: []
        }
        onChange([...sections, newSection])
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id)
            const newIndex = sections.findIndex((s) => s.id === over.id)
            onChange(arrayMove(sections, oldIndex, newIndex))
        }
    }

    const updateSection = (id: string, field: keyof ExamSection, value: any) => {
        onChange(sections.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    const removeSection = (id: string) => {
        onChange(sections.filter(s => s.id !== id))
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold border-b pb-2">2. Secciones del Examen</h2>

            <div className="flex flex-wrap gap-2 mb-6">
                <Button onClick={() => handleAddSection('TEST')} size="sm" variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300">
                    <TestTube className="w-3.5 h-3.5 mr-1.5" />
                    + Test
                </Button>
                <Button onClick={() => handleAddSection('DEVELOP')} size="sm" variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300">
                    <Code2 className="w-3.5 h-3.5 mr-1.5" />
                    + Desarrollar
                </Button>
                <Button onClick={() => handleAddSection('STANDARD')} size="sm" variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300">
                    <Type className="w-3.5 h-3.5 mr-1.5" />
                    + Texto Libre
                </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {sections.map((section) => (
                            <SortableSectionItem
                                key={section.id}
                                section={section}
                                onUpdate={updateSection}
                                onRemove={removeSection}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {sections.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                        <Plus className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">Añade secciones para construir el examen</p>
                    <p className="text-slate-300 text-sm mt-1">Selecciona el tipo de contenido arriba</p>
                </div>
            )}
        </div>
    )
}

function SortableSectionItem({
    section,
    onUpdate,
    onRemove
}: {
    section: ExamSection,
    onUpdate: (id: string, field: keyof ExamSection, value: any) => void,
    onRemove: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleTestQuestionChange = (value: string) => {
        // 1. Auto-format answers: Find patterns like "space + a)" and ensure they start on new line
        let formatted = value.replace(/([^\n])\s+([a-eA-E][\)])/g, '$1\n$2')

        // 2. Auto-renumber questions: Find lines starting with "Number." and re-index them sequentially
        let questionCounter = 1
        formatted = formatted.replace(/^\d+[\.\)]\s/gm, (match) => {
            return `${questionCounter++}. `
        })

        onUpdate(section.id, 'questions', formatted)
    }

    const getSectionStyles = (type: string) => {
        switch (type) {
            case 'TEST':
                return {
                    borderLeft: 'border-l-blue-400',
                    badge: 'bg-blue-50 text-blue-700 border-blue-100',
                    label: 'Test',
                    icon: <TestTube className="w-3.5 h-3.5" />
                }
            case 'DEVELOP':
                return {
                    borderLeft: 'border-l-emerald-400',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    label: 'Desarrollo',
                    icon: <Code2 className="w-3.5 h-3.5" />
                }
            case 'STANDARD':
            default:
                return {
                    borderLeft: 'border-l-amber-400',
                    badge: 'bg-amber-50 text-amber-700 border-amber-100',
                    label: 'Libre',
                    icon: <Type className="w-3.5 h-3.5" />
                }
        }
    }

    const { borderLeft, badge, label, icon } = getSectionStyles(section.type)

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "border rounded-2xl p-6 bg-white relative group transition-all duration-300 shadow-md hover:shadow-lg border-l-4",
                borderLeft,
                "hover:scale-[1.01]"
            )}
        >
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", badge)}>
                    {icon}
                    {label}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-md transition-colors">
                    <Grip className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        value={section.title}
                        onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
                        className="font-bold text-slate-800 border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 rounded-xl"
                        placeholder="Título de la sección"
                    />
                    <Input
                        value={section.ra ? section.ra.join(', ') : ''}
                        onChange={(e) => onUpdate(section.id, 'ra', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="RAs evaluados (RA1, RA2...)"
                        className="border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 rounded-xl"
                    />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(section.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="pl-9">
                {section.type === 'TEST' && (
                    <div className="space-y-2">
                        <Label>Preguntas de Test (Una por línea)</Label>
                        <Textarea
                            value={section.questions}
                            onChange={(e) => handleTestQuestionChange(e.target.value)}
                            placeholder="1. Pregunta...\n   a) Opción...\n   b) Opción..."
                            rows={15}
                            className="min-h-[150px]"
                        />
                    </div>
                )}
                {section.type === 'DEVELOP' && (
                    <div className="space-y-2">
                        <Label>Preguntas a Desarrollar (Admite tablas)</Label>
                        <RichTextEditor
                            value={section.questions ?? ''}
                            onChange={(val) => onUpdate(section.id, 'questions', val)}
                            placeholder="Escribe las preguntas a desarrollar o pega una tabla..."
                        />
                    </div>
                )}
                {section.type === 'STANDARD' && (
                    <div className="space-y-2">
                        <Label>Contenido (Admite tablas)</Label>
                        <RichTextEditor
                            value={section.content ?? ''}
                            onChange={(val) => onUpdate(section.id, 'content', val)}
                            placeholder="Texto libre o tablas..."
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
