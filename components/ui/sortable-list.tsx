'use client'

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 mb-2 bg-white p-3 rounded-lg border border-gray-200 group">
            <div {...attributes} {...listeners} className="mt-1.5 cursor-move text-gray-400 hover:text-gray-600 focus:outline-none">
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

interface SortableListProps<T extends { id: string }> {
    items: T[];
    onReorder: (items: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
}

export function SortableList<T extends { id: string }>({ items, onReorder, renderItem }: SortableListProps<T>) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            onReorder(arrayMove(items, oldIndex, newIndex));
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
            >
                {items.map((item, index) => (
                    <SortableItem key={item.id} id={item.id}>
                        {renderItem(item, index)}
                    </SortableItem>
                ))}
            </SortableContext>
        </DndContext>
    );
}
