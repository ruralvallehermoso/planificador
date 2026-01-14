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
                "text-xs px-2 py-1.5 rounded-lg mb-1 cursor-grab active:cursor-grabbing shadow-sm transition-all font-medium truncate",
                isDragging
                    ? "opacity-50 bg-indigo-500 text-white rotate-2 scale-105 shadow-xl ring-2 ring-indigo-300 z-50"
                    : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-100 shadow-sm"
            )}
        >
            <div className="flex items-center">
                {startTime && <span className="text-[10px] font-bold mr-1.5 opacity-60">{startTime}</span>}
                <span>{title}</span>
            </div>
        </div>
    )
}
