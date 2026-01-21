'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { getFilters, createFilter, updateFilter, deleteFilter } from '@/app/comidas/actions';
import { useRouter } from 'next/navigation';

interface Filter {
    id: string;
    name: string;
    color: string;
}

interface FilterManagerProps {
    open: boolean;
    onClose: () => void;
}

const PRESET_COLORS = [
    '#f97316', // orange
    '#ef4444', // red
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f59e0b', // amber
];

export function FilterManager({ open, onClose }: FilterManagerProps) {
    const router = useRouter();
    const [filters, setFilters] = useState<Filter[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', color: PRESET_COLORS[0] });

    useEffect(() => {
        if (open) {
            loadFilters();
        }
    }, [open]);

    const loadFilters = async () => {
        const data = await getFilters();
        setFilters(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setLoading(true);
        try {
            if (editingId) {
                await updateFilter(editingId, formData);
            } else {
                await createFilter(formData);
            }
            setFormData({ name: '', color: PRESET_COLORS[0] });
            setEditingId(null);
            await loadFilters();
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error al guardar el filtro');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (filter: Filter) => {
        setEditingId(filter.id);
        setFormData({ name: filter.name, color: filter.color });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este filtro?')) return;

        setLoading(true);
        try {
            await deleteFilter(id);
            await loadFilters();
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar el filtro');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', color: PRESET_COLORS[0] });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Gestionar Filtros</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {editingId ? 'Editar Filtro' : 'Nuevo Filtro'}
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Ej: Cena, Desayuno, Niños..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 border rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading || !formData.name.trim()}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingId ? 'Guardar' : <><Plus className="w-4 h-4" /> Añadir</>}
                            </button>
                        </div>
                    </form>

                    {/* Existing Filters */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">Filtros existentes</h3>

                        {filters.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No hay filtros creados todavía</p>
                        ) : (
                            <div className="space-y-2">
                                {filters.map(filter => (
                                    <div
                                        key={filter.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: filter.color }}
                                            />
                                            <span className="font-medium text-gray-900">{filter.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(filter)}
                                                className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(filter.id)}
                                                className="p-2 hover:bg-red-100 rounded-lg text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
