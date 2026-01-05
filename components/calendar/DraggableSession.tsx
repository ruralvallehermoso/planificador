'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'

interface Props {
    id: string
    title: string
    startTime?: string | null
}

export function DraggableSession({ id, title, startTime }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { title, startTime }
    })

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 50,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "text-xs p-1 rounded mb-1 cursor-grab active:cursor-grabbing border shadow-sm transition-shadow",
                isDragging ? "opacity-50 bg-indigo-100 border-indigo-300 ring-2 ring-indigo-400" : "bg-white border-gray-200 hover:border-indigo-300 hover:shadow"
            )}
        >
            <div className="font-medium text-gray-800 truncate">
                {startTime && <span className="text-gray-500 mr-1">{startTime}</span>}
                {title}
            </div>
        </div>
    )
}
