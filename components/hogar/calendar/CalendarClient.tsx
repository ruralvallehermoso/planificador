'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, AlertCircle, MapPin, AlignLeft, CalendarDays, Gift, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface HomeEvent {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    eventType: string; // EVENT, BIRTHDAY, REMINDER
    color: string | null;
}

const EVENT_TYPES = [
    { value: 'EVENT', label: 'Evento', icon: CalendarDays },
    { value: 'BIRTHDAY', label: 'Cumpleaños', icon: Gift },
    { value: 'REMINDER', label: 'Recordatorio', icon: Bell },
];

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function CalendarClient() {
    const router = useRouter();
    const [events, setEvents] = useState<HomeEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [eventType, setEventType] = useState('EVENT');
    const [color, setColor] = useState(COLORS[4]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/hogar/events');
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();
            setEvents(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !startDate) return;

        try {
            const res = await fetch('/api/hogar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: description || null,
                    startDate,
                    endDate: endDate || null,
                    eventType,
                    color
                }),
            });

            if (!res.ok) throw new Error('Failed to create event');

            const newEvent = await res.json();

            // Optimistically insert and sort
            const updatedEvents = [...events, newEvent].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

            setEvents(updatedEvents);
            setTitle('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            setIsAdding(false);
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('¿Eliminar este evento?')) return;

        const prevEvents = [...events];
        setEvents(events.filter(e => e.id !== id));

        try {
            const res = await fetch(`/api/hogar/events/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                setEvents(prevEvents);
                throw new Error('Failed to delete event');
            }
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto mt-8">
                <AlertCircle className="w-5 h-5" />
                <p>Error cargando calendario: {error}</p>
            </div>
        );
    }

    const today = startOfDay(new Date());
    const upcomingEvents = events.filter(e => isAfter(new Date(e.startDate), today) || isSameDay(new Date(e.startDate), today));
    const pastEvents = events.filter(e => isBefore(new Date(e.startDate), today) && !isSameDay(new Date(e.startDate), today));

    const renderEvent = (event: HomeEvent) => {
        const typeConfig = EVENT_TYPES.find(t => t.value === event.eventType) || EVENT_TYPES[0];
        const Icon = typeConfig.icon;

        return (
            <div key={event.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: event.color || '#e5e7eb' }} />

                <div className="flex-shrink-0 w-16 text-center pl-2">
                    <div className="text-2xl font-black text-gray-900 leading-none mb-1">
                        {format(new Date(event.startDate), 'dd')}
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {format(new Date(event.startDate), 'MMM', { locale: es })}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900 truncate">{event.title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {format(new Date(event.startDate), 'HH:mm')}
                            {event.endDate && ` - ${format(new Date(event.endDate), 'HH:mm')}`}
                        </span>
                    </div>

                    {event.description && (
                        <p className="text-gray-600 text-sm mt-2 flex items-start gap-2">
                            <AlignLeft className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                            <span className="line-clamp-2">{event.description}</span>
                        </p>
                    )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar evento"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 text-violet-600 mb-4 shadow-sm">
                    <CalendarIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario Familiar</h1>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Próximos eventos, cumpleaños y recordatorios importantes.
                </p>
            </div>

            <div className="mb-8 flex justify-center">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" /> Añadir Evento
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-violet-100 mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                                placeholder="Ej. Cena con los abuelos"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fin (Opcional)</label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <div className="flex gap-2">
                                    {EVENT_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setEventType(type.value)}
                                            className={`flex-1 py-2 px-3 rounded-lg border text-sm flex justify-center items-center gap-2 transition-colors ${eventType === type.value ? 'bg-violet-50 border-violet-500 text-violet-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <type.icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <div className="flex gap-2 h-10 items-center">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-violet-500' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
                                placeholder="Detalles adicionales..."
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!title.trim() || !startDate}
                                className="px-6 py-3 rounded-xl font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
                            >
                                Guardar Evento
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {upcomingEvents.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 sticky top-0 bg-gray-50/90 backdrop-blur-md py-2 z-10">Próximos Eventos</h2>
                        <div className="space-y-3">
                            {upcomingEvents.map(renderEvent)}
                        </div>
                    </div>
                )}

                {pastEvents.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-400 mb-4">Eventos Pasados</h2>
                        <div className="space-y-3 opacity-60">
                            {pastEvents.map(renderEvent)}
                        </div>
                    </div>
                )}

                {events.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <CalendarIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes eventos</h3>
                        <p className="text-gray-500">
                            Añade tu primer evento para organizar tu agenda familiar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
