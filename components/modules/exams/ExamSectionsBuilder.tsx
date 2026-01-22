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
import { Plus, Trash2, GripVertical } from "lucide-react"
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

            <div className="flex gap-2 mb-4">
                <Button onClick={() => handleAddSection('TEST')} size="sm" variant="outline">+ Test</Button>
                <Button onClick={() => handleAddSection('DEVELOP')} size="sm" variant="outline">+ Desarrollar</Button>
                <Button onClick={() => handleAddSection('STANDARD')} size="sm" variant="outline">+ Texto Libre</Button>
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
                <p className="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg">
                    Añade secciones para construir el examen
                </p>
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

    return (
        <div ref={setNodeRef} style={style} className="border rounded-md p-4 bg-gray-50 relative group">
            <div className="flex items-center gap-3 mb-3">
                <div {...attributes} {...listeners} className="cursor-move p-1 text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        value={section.title}
                        onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
                        className="font-medium"
                        placeholder="Título de la sección"
                    />
                    <Input
                        value={section.ra ? section.ra.join(', ') : ''}
                        onChange={(e) => onUpdate(section.id, 'ra', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="RAs evaluados en esta sección"
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(section.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
                        <Label>Preguntas a Desarrollar</Label>
                        <Textarea
                            value={section.questions || ''}
                            onChange={(e) => onUpdate(section.id, 'questions', e.target.value)}
                            placeholder="Escribe las preguntas a desarrollar..."
                            rows={15}
                            className="min-h-[150px]"
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
