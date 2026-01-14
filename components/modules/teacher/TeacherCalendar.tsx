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
        data: { date: dateStr }
    })

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "relative flex flex-col p-2 min-h-[100px] transition-all rounded-2xl group",
                !isCurrentMonth ? "bg-transparent text-gray-300" : "bg-white shadow-sm border border-gray-100",
                isDayHoliday && "bg-red-50/30 border-red-100",
                isDayWeekend && !isDayHoliday && "bg-gray-50/50",
                isOver && "ring-2 ring-indigo-400 scale-[1.02] z-10",
                isTodayDate && "ring-2 ring-indigo-600 shadow-md"
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <span
                    className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        isTodayDate && "bg-indigo-600 text-white",
                        !isTodayDate && isCurrentMonth && "text-gray-900",
                        !isTodayDate && !isCurrentMonth && "text-gray-300",
                        isDayHoliday && !isTodayDate && "text-red-500"
                    )}
                >
                    {format(date, 'd')}
                </span>
                {!isDayHoliday && isCurrentMonth && (
                    <button
                        onClick={() => onAddClass(date)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-full text-indigo-600 transition-all transform hover:scale-110"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 space-y-1.5 overflow-hidden">
                {isDayHoliday && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 text-center py-1">
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
            <div className="flex h-full flex-col bg-gray-50/50 p-4 sm:p-6 rounded-3xl">
                {/* Calendar Header - Swiss Style (Bold & Massive) */}
                <div className="flex items-end justify-between mb-8 px-2">
                    <div>
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none">
                            {format(currentDate, 'MMMM', { locale: es })}
                        </h2>
                        <span className="text-xl font-medium text-gray-400 ml-1">
                            {format(currentDate, 'yyyy', { locale: es })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all border border-transparent hover:border-gray-200">
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors">
                            HOY
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all border border-transparent hover:border-gray-200">
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 mb-2 px-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                        <div key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Bento Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6 gap-2">
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
