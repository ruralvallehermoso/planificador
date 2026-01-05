'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/es';
import { Settings, Save, RefreshCw, Calendar as CalendarIcon, AlertCircle, Plus, Trash2, X, Edit2, Loader2 } from 'lucide-react';
import { CustomToolbar } from '@/components/calendar/CustomToolbar';
import { v4 as uuidv4 } from 'uuid';

// Setup the localizer
moment.locale('es');
const localizer = momentLocalizer(moment);

interface CalendarSource {
    id: string;
    name: string;
    url?: string; // Optional for local
    type: 'local' | 'remote';
    color: string;
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    desc?: string;
    location?: string;
    sourceId: string;
    color: string;
    isLocal?: boolean;
}

const PASTEL_COLORS = [
    { name: 'Azul', value: '#3b82f6', bg: '#dbeafe', text: '#1e40af' },
    { name: 'Verde', value: '#10b981', bg: '#d1fae5', text: '#065f46' },
    { name: 'Violeta', value: '#8b5cf6', bg: '#ede9fe', text: '#5b21b6' },
    { name: 'Naranja', value: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
    { name: 'Rosa', value: '#ec4899', bg: '#fce7f3', text: '#9d174d' },
    { name: 'Rojo', value: '#ef4444', bg: '#fee2e2', text: '#991b1b' },
];

const CALENDAR_STYLES = `
    .rbc-calendar { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .rbc-header { 
        padding: 8px 4px; 
        font-weight: 600; 
        color: #4b5563; 
        border-bottom: 1px solid #e5e7eb;
        text-transform: capitalize;
    }
    .rbc-month-view { border: none; border-top: 1px solid #e5e7eb; }
    .rbc-month-row { border-top: 1px solid #e5e7eb; min-height: 120px; }
    .rbc-day-bg { border-left: 1px solid #e5e7eb; }
    .rbc-date-cell { padding: 8px; font-weight: 500; color: #374151; }
    .rbc-off-range-bg { background-color: #f9fafb; }
    .rbc-today { background-color: transparent; }
    .rbc-event {
        border-radius: 6px;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: none;
        padding: 2px 6px;
        font-size: 13px;
        font-weight: 500;
        margin: 1px 4px;
        transition: transform 0.1s;
    }
    .rbc-event:hover { transform: scale(1.01); }
    .rbc-current-time-indicator { background-color: #ef4444; }
`;

export default function CalendarioPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [sources, setSources] = useState<CalendarSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Event Modal State
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Creating or Updating
    const [eventForm, setEventForm] = useState({
        title: '',
        start: new Date(),
        end: new Date(),
        desc: '',
        location: '',
        allDay: false
    });

    // New Source Form State
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [newSourceColor, setNewSourceColor] = useState(PASTEL_COLORS[0].value);

    // Controlled state for navigation
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const onNavigate = useCallback((newDate: Date) => setDate(newDate), []);
    const onView = useCallback((newView: any) => setView(newView), []);

    // Load Sources from local storage on mount
    useEffect(() => {
        const savedSources = localStorage.getItem('hogar_calendar_sources');
        let loadedSources: CalendarSource[] = [];

        if (savedSources) {
            try {
                loadedSources = JSON.parse(savedSources);
                // Ensure legacy sources have type 'remote'
                loadedSources = loadedSources.map(s => ({ ...s, type: s.type || 'remote' }));
            } catch (e) {
                console.error('Error parsing sources', e);
            }
        }

        // Ensure "Personal (Local)" source always exists
        const localSource = loadedSources.find(s => s.type === 'local');
        if (!localSource) {
            loadedSources.unshift({
                id: 'local',
                name: 'Personal',
                type: 'local',
                color: PASTEL_COLORS[0].value
            });
            localStorage.setItem('hogar_calendar_sources', JSON.stringify(loadedSources));
        }

        setSources(loadedSources);
    }, []);

    // Fetch events whenever sources change (and on mount after sources set)
    useEffect(() => {
        if (sources.length > 0) {
            fetchAllEvents();
        }
    }, [sources]);

    const fetchAllEvents = async () => {
        setIsLoading(true);
        setError(null);
        let allEvents: CalendarEvent[] = [];

        try {
            await Promise.all(sources.map(async (source) => {
                try {
                    let sourceEvents: any[] = [];

                    if (source.type === 'local') {
                        // Fetch from internal API
                        const res = await fetch('/api/events');
                        if (!res.ok) throw new Error('Failed to fetch local events');
                        const data = await res.json();
                        sourceEvents = data.map((evt: any) => ({
                            ...evt,
                            start: new Date(evt.start),
                            end: new Date(evt.end),
                            sourceId: 'local',
                            color: source.color,
                            isLocal: true
                        }));
                    } else if (source.url) {
                        // Fetch from iCal proxy
                        const response = await fetch(`/api/calendar?url=${encodeURIComponent(source.url)}`);
                        if (!response.ok) throw new Error(`Error en ${source.name}`);
                        const data = await response.json();
                        sourceEvents = data.map((evt: any) => ({
                            ...evt,
                            start: new Date(evt.start),
                            end: new Date(evt.end),
                            sourceId: source.id,
                            color: source.color,
                            isLocal: false
                        }));
                    }

                    allEvents = [...allEvents, ...sourceEvents];
                } catch (err) {
                    console.error(`Failed to fetch ${source.name}`, err);
                }
            }));

            // Remove duplicates if any (simple check by ID)
            const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.id, item])).values());
            setEvents(uniqueEvents);
        } catch (err) {
            setError('Error general cargando eventos.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Event Handling ---

    const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
        // Open modal to create new event
        setEventForm({
            title: '',
            start,
            end,
            desc: '',
            location: '',
            allDay: false
        });
        setSelectedEvent(null);
        setIsEditing(true);
        setIsEventModalOpen(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setEventForm({
            title: event.title,
            start: event.start,
            end: event.end,
            desc: event.desc || '',
            location: event.location || '',
            allDay: event.allDay || false
        });
        // If it's local, allow edit
        setIsEditing(!!event.isLocal);
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = async () => {
        if (!eventForm.title) return;

        try {
            const method = selectedEvent ? 'PUT' : 'POST';
            const body = {
                ...eventForm,
                id: selectedEvent?.id,
                color: sources.find(s => s.type === 'local')?.color || PASTEL_COLORS[0].value
            };

            const res = await fetch('/api/events', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to save event');

            setIsEventModalOpen(false);
            fetchAllEvents(); // Refresh
        } catch (e) {
            setError('Error al guardar el evento');
            console.error(e);
        }
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent || !selectedEvent.isLocal) return;
        if (!confirm('¿Seguro que quieres borrar este evento?')) return;

        try {
            const res = await fetch(`/api/events?id=${selectedEvent.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            setIsEventModalOpen(false);
            fetchAllEvents();
        } catch (e) {
            setError('Error al borrar el evento');
        }
    };

    // --- Source Management ---

    const handleAddSource = () => {
        if (!newSourceName || !newSourceUrl) return;

        const newSource: CalendarSource = {
            id: uuidv4(),
            name: newSourceName,
            url: newSourceUrl,
            type: 'remote',
            color: newSourceColor
        };

        const updatedSources = [...sources, newSource];
        setSources(updatedSources);
        localStorage.setItem('hogar_calendar_sources', JSON.stringify(updatedSources));

        // Reset form
        setNewSourceName('');
        setNewSourceUrl('');
        setNewSourceColor(PASTEL_COLORS[0].value);
    };

    const handleDeleteSource = (id: string) => {
        const updatedSources = sources.filter(s => s.id !== id);
        setSources(updatedSources);
        localStorage.setItem('hogar_calendar_sources', JSON.stringify(updatedSources));
    };

    const getEventStyle = (event: CalendarEvent) => {
        const colorConfig = PASTEL_COLORS.find(c => c.value === event.color) || PASTEL_COLORS[0];
        return {
            style: {
                backgroundColor: colorConfig.bg,
                color: colorConfig.text,
                borderLeft: `3px solid ${event.color}`
            }
        };
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-gray-50">
            <style>{CALENDAR_STYLES}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1"></div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchAllEvents}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-gray-900 transition-all"
                        title="Recargar eventos"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all ${showSettings ? 'text-indigo-600 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        title="Gestionar calendarios"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Calendar Component */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1 overflow-hidden relative">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={view}
                    date={date}
                    onNavigate={onNavigate}
                    onView={onView}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    components={{
                        toolbar: CustomToolbar
                    }}
                    messages={{
                        noEventsInRange: 'No hay eventos',
                    }}
                    eventPropGetter={(event) => getEventStyle(event)}
                />
            </div>

            {/* --- Modals --- */}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" />
                                Configurar Calendarios
                            </h3>
                            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Source List */}
                            <div className="space-y-3">
                                {sources.map(source => (
                                    <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: source.color }}></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">{source.name}</p>
                                                    {source.type === 'local' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">LOCAL</span>}
                                                </div>
                                                {source.url && <p className="text-xs text-gray-500 truncate max-w-[250px]">{source.url}</p>}
                                            </div>
                                        </div>
                                        {source.type !== 'local' && (
                                            <button onClick={() => handleDeleteSource(source.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add New Source */}
                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4">Añadir Calendario iCal</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={newSourceName}
                                        onChange={(e) => setNewSourceName(e.target.value)}
                                        placeholder="Nombre (ej: Trabajo)"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newSourceUrl}
                                        onChange={(e) => setNewSourceUrl(e.target.value)}
                                        placeholder="URL privada (.ics)"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                    />
                                    <div className="flex gap-2 pt-2">
                                        {PASTEL_COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => setNewSourceColor(c.value)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${newSourceColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'}`}
                                                style={{ backgroundColor: c.value }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleAddSource}
                                        disabled={!newSourceName || !newSourceUrl}
                                        className="w-full mt-2 flex justify-center items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg shadow-indigo-200"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Añadir Calendario
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Modal (View/Create/Edit) */}
            {isEventModalOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsEventModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isEditing ? (selectedEvent ? 'Editar Evento' : 'Nuevo Evento') : 'Detalles del Evento'}
                                </h3>
                                <button onClick={() => setIsEventModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* View Mode (Read Only) */}
                            {!isEditing && selectedEvent && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-800 leading-tight mb-2">{selectedEvent.title}</h4>
                                        <p className="text-indigo-600 font-medium text-sm flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            {moment(selectedEvent.start).format('LLLL')}
                                        </p>
                                    </div>

                                    {selectedEvent.desc && (
                                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100">
                                            {selectedEvent.desc}
                                        </div>
                                    )}

                                    {selectedEvent.location && (
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            📍 {selectedEvent.location}
                                        </p>
                                    )}

                                    {!selectedEvent.isLocal && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                                Evento externo (Solo lectura)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Edit/Create Mode */}
                            {isEditing && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Título</label>
                                        <input
                                            type="text"
                                            value={eventForm.title}
                                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Título del evento"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Inicio</label>
                                            <input
                                                type="datetime-local"
                                                value={moment(eventForm.start).format('YYYY-MM-DDTHH:mm')}
                                                onChange={(e) => setEventForm({ ...eventForm, start: new Date(e.target.value) })} // Simple conversion
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fin</label>
                                            <input
                                                type="datetime-local"
                                                value={moment(eventForm.end).format('YYYY-MM-DDTHH:mm')}
                                                onChange={(e) => setEventForm({ ...eventForm, end: new Date(e.target.value) })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ubicación</label>
                                        <input
                                            type="text"
                                            value={eventForm.location}
                                            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            placeholder="Opcional"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
                                        <textarea
                                            value={eventForm.desc}
                                            onChange={(e) => setEventForm({ ...eventForm, desc: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
                                            placeholder="Notas..."
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            onClick={handleSaveEvent}
                                            disabled={!eventForm.title}
                                            className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
                                        >
                                            Guardar
                                        </button>
                                        {selectedEvent && (
                                            <button
                                                onClick={handleDeleteEvent}
                                                className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
