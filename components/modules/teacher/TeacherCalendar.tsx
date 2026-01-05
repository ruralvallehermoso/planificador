'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, startOfWeek, endOfWeek, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { clsx } from 'clsx'
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'

import { isHoliday, isWeekend } from '@/components/calendar/holidays/madrid'
import { DraggableSession } from '@/components/calendar/DraggableSession'
import { getClassSessions, updateClassSessionDate, createClassSession } from '@/lib/actions/teacher'

// Mock initial data if fetch fails or for immediate feedback
type Session = { id: string; title: string; date: Date; startTime?: string | null }

function DroppableDay({ date, children, isCurrentMonth, isDayHoliday, isDayWeekend, isTodayDate, onAddClass }: any) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const { isOver, setNodeRef } = useDroppable({
        id: dateStr,
        data: { date: dateStr } // Passing date string data
    })

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "relative flex flex-col py-2 px-3 border-r border-b min-h-[100px] transition-colors group",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                isDayHoliday && "bg-red-50/50",
                isDayWeekend && !isDayHoliday && "bg-gray-50/30",
                isOver && "bg-indigo-50 ring-2 ring-inset ring-indigo-400 z-10",
                !isOver && "hover:bg-gray-50"
            )}
        >
            <div className="flex items-center justify-between">
                <span
                    className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                        isTodayDate && "bg-indigo-600 text-white",
                        !isTodayDate && isCurrentMonth && "text-gray-900",
                        !isTodayDate && !isCurrentMonth && "text-gray-400",
                        isDayHoliday && !isTodayDate && "text-red-600"
                    )}
                >
                    {format(date, 'd')}
                </span>
                {!isDayHoliday && (
                    <button
                        onClick={() => onAddClass(date)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="mt-2 flex-1 space-y-1">
                {isDayHoliday && (
                    <div className="text-xs font-medium text-red-600 bg-red-50 rounded px-1 py-0.5 truncate border border-red-100">
                        Festivo
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}

export function TeacherCalendar({ categoryId }: { categoryId: string }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [sessions, setSessions] = useState<Session[]>([])

    const firstDayOfMonth = startOfMonth(currentDate)
    const lastDayOfMonth = endOfMonth(currentDate)
    const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
    const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Fetch sessions on month change
    useEffect(() => {
        getClassSessions(startDate, endDate).then(res => {
            if (res.success && res.data) {
                setSessions(res.data)
            }
        })
    }, [currentDate])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const newDate = new Date(over.id as string)
            console.log(`Moved session ${active.id} to date ${over.id}`)

            // Optimistic update
            setSessions(prev => prev.map(s => {
                if (s.id === active.id) {
                    return { ...s, date: newDate }
                }
                return s
            }))

            await updateClassSessionDate(active.id as string, newDate)
        }
    }

    const handleAddClass = async (date: Date) => {
        const title = window.prompt("Título de la clase:")
        if (title) {
            const res = await createClassSession({ title, date, categoryId })
            if (res.success && res.data) {
                setSessions([...sessions, res.data])
            }
        }
    }

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-full flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                            Hoy
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 border-b bg-gray-50 text-xs font-semibold leading-6 text-gray-500">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                        <div key={day} className="py-2 text-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
                    {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const daySessions = sessions.filter(s => format(new Date(s.date), 'yyyy-MM-dd') === dateStr)

                        return (
                            <DroppableDay
                                key={day.toString()}
                                date={day}
                                isCurrentMonth={isSameMonth(day, currentDate)}
                                isDayHoliday={isHoliday(dateStr)}
                                isDayWeekend={isWeekend(day)}
                                isTodayDate={isToday(day)}
                                onAddClass={handleAddClass}
                            >
                                {daySessions.map(session => (
                                    <DraggableSession
                                        key={session.id}
                                        id={session.id}
                                        title={session.title}
                                        startTime={session.startTime}
                                    />
                                ))}
                            </DroppableDay>
                        )
                    })}
                </div>
            </div>
        </DndContext>
    )
}
